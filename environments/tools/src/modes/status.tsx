import fs from "node:fs";
import path from "node:path";
import {execSync} from "node:child_process";
import {fileExists, getPathFromMonorepo, loadToolsEnv, parseEnvFile} from "../config/loadEnv.js";
import {type StatusMessage, type ToolsEnv} from "../config/schema.js";

function add(list: StatusMessage[], level: StatusMessage["level"], message: string): void {
  list.push({level, message});
}

function requiredEnvKeys(filePath: string, keys: string[]): StatusMessage[] {
  const messages: StatusMessage[] = [];
  if (!fileExists(filePath)) {
    add(messages, "FAIL", `${filePath} is missing`);
    return messages;
  }

  const env = parseEnvFile(filePath);
  for (const key of keys) {
    if (!env[key] || env[key].trim().length === 0) {
      add(messages, "FAIL", `${filePath} is missing required key: ${key}`);
    }
  }

  if (messages.length === 0) {
    add(messages, "PASS", `${filePath} exists and required keys are present`);
  }

  return messages;
}

function canHttpProbe(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function httpProbe(url: string): StatusMessage {
  if (!canHttpProbe(url)) {
    return {level: "WARN", message: `Cannot probe non-http URL: ${url}`};
  }

  try {
    execSync(`wget -q --spider --timeout=4 --tries=1 "${url}"`, {stdio: "pipe"});
    return {level: "PASS", message: `Reachable: ${url}`};
  } catch {
    return {level: "WARN", message: `Not reachable right now: ${url}`};
  }
}

function evaluateConnections(env: ToolsEnv): StatusMessage[] {
  const messages: StatusMessage[] = [];
  const prodCaddyPath = getPathFromMonorepo("environments/production/Caddyfile");

  if (!fileExists("environments/tools/.env")) {
    add(messages, "FAIL", "environments/tools/.env not found");
    return messages;
  }

  add(messages, "PASS", "environments/tools/.env found");

  if (env.ACTIVE_REVERSE_PROXY) {
    if (!env.PUBLIC_BASE_URL) {
      add(messages, "FAIL", "PUBLIC_BASE_URL is required when ACTIVE_REVERSE_PROXY=true");
    } else {
      add(messages, "PASS", `PUBLIC_BASE_URL configured: ${env.PUBLIC_BASE_URL}`);
      messages.push(httpProbe(env.PUBLIC_BASE_URL));
    }

    if (!fs.existsSync(prodCaddyPath)) {
      add(messages, "FAIL", "Production Caddyfile not found");
    } else {
      const caddy = fs.readFileSync(prodCaddyPath, "utf8");
      const hasApp = caddy.includes("/app*");
      const hasChat = caddy.includes("/chat*");
      if (hasApp && hasChat) {
        add(messages, "PASS", "Production Caddyfile has /app and /chat routes");
      } else {
        add(messages, "FAIL", "Production Caddyfile missing expected /app* or /chat* route");
      }
    }
  }

  if (env.ACTIVE_UI) {
    const uiChecks = requiredEnvKeys("ui/.env", ["VITE_BASE_URL"]);
    messages.push(...uiChecks);
  }

  if (env.ACTIVE_API) {
    if (env.API_MODE === "remote") {
      if (!env.REMOTE_API_BASE_URL) {
        add(messages, "FAIL", "REMOTE_API_BASE_URL is required when API_MODE=remote");
      } else {
        add(messages, "PASS", `REMOTE_API_BASE_URL configured: ${env.REMOTE_API_BASE_URL}`);
        messages.push(httpProbe(env.REMOTE_API_BASE_URL));
      }
    } else {
      messages.push(
        ...requiredEnvKeys("api/.env", [
          "DATABASE_URL",
          "GHOST_BASE_URL",
          "GHOST_MEMBERS_API_AUDIENCE",
          "GHOST_MEMBERS_API_ISSUER"
        ])
      );
      add(
        messages,
        "WARN",
        "API is not part of environments/production/docker-compose.yml; start it in a separate deployment if needed."
      );
    }
  }

  if (env.ACTIVE_CHATBOT) {
    if (env.CHATBOT_MODE === "remote") {
      if (!env.REMOTE_CHATBOT_BASE_URL) {
        add(messages, "FAIL", "REMOTE_CHATBOT_BASE_URL is required when CHATBOT_MODE=remote");
      } else {
        add(messages, "PASS", `REMOTE_CHATBOT_BASE_URL configured: ${env.REMOTE_CHATBOT_BASE_URL}`);
        messages.push(httpProbe(env.REMOTE_CHATBOT_BASE_URL));
      }
    } else {
      messages.push(
        ...requiredEnvKeys("chatbot_backend/.env", ["OPENAI_API_KEY", "DATABASE_URL", "PGVECTOR_CONNECTION"])
      );
    }
  }

  if (env.ACTIVE_GHOST) {
    messages.push(...requiredEnvKeys("environments/production/.env", ["PUBLIC_URL", "GHOST_DB_PASSWORD"]));
  }

  return messages;
}

function printPieces(env: ToolsEnv): void {
  console.log("Active pieces:");
  console.log(`- ui: ${env.ACTIVE_UI}`);
  console.log(`- reverse-proxy(caddy): ${env.ACTIVE_REVERSE_PROXY}`);
  console.log(`- api: ${env.ACTIVE_API} (${env.API_MODE})`);
  console.log(`- chatbot_backend: ${env.ACTIVE_CHATBOT} (${env.CHATBOT_MODE})`);
  console.log(`- ghost: ${env.ACTIVE_GHOST}`);
}

function levelPrefix(level: StatusMessage["level"]): string {
  if (level === "PASS") return "[PASS]";
  if (level === "WARN") return "[WARN]";
  return "[FAIL]";
}

export function runStatus(): void {
  const env = loadToolsEnv();
  printPieces(env);

  const checks = evaluateConnections(env);
  console.log("");
  console.log("Checks:");
  for (const c of checks) {
    console.log(`${levelPrefix(c.level)} ${c.message}`);
  }

  const failCount = checks.filter((c) => c.level === "FAIL").length;
  const warnCount = checks.filter((c) => c.level === "WARN").length;
  console.log("");
  console.log(`Summary: ${failCount} fail, ${warnCount} warn, ${checks.length - failCount - warnCount} pass`);
}

function collectProductionServices(env: ToolsEnv): string[] {
  const selected = new Set<string>();
  if (env.ACTIVE_REVERSE_PROXY) selected.add("caddy");
  if (env.ACTIVE_UI) selected.add("ui");
  if (env.ACTIVE_CHATBOT && env.CHATBOT_MODE === "all_together") selected.add("mamute-politico-chatbot");
  if (env.ACTIVE_GHOST) {
    selected.add("ghost");
    selected.add("ghost-db");
  }
  return [...selected];
}

function runCompose(command: string, services: string[]): void {
  const composePath = getPathFromMonorepo("environments/production/docker-compose.yml");
  const envPath = getPathFromMonorepo("environments/production/.env");
  const args: string[] = ["docker", "compose", "-f", composePath];

  if (fs.existsSync(envPath)) {
    args.push("--env-file", envPath);
  }

  args.push(...command.split(" "), ...services);
  const finalCommand = args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ");
  execSync(finalCommand, {stdio: "inherit"});
}

export function runUp(): void {
  const env = loadToolsEnv();
  const services = collectProductionServices(env);
  if (services.length === 0) {
    console.log("No production services selected in tools/.env.");
    return;
  }

  console.log(`Starting production services: ${services.join(", ")}`);
  runCompose("up -d --build", services);
}

export function runDown(): void {
  const env = loadToolsEnv();
  const services = collectProductionServices(env);
  if (services.length === 0) {
    console.log("No production services selected in tools/.env.");
    return;
  }

  console.log(`Stopping/removing selected production services: ${services.join(", ")}`);
  runCompose("rm -s -f", services);
}
