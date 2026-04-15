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
    add(messages, "FAIL", `${filePath} não existe`);
    return messages;
  }

  const env = parseEnvFile(filePath);
  for (const key of keys) {
    if (!env[key] || env[key].trim().length === 0) {
      add(messages, "FAIL", `${filePath} não possui a chave obrigatória: ${key}`);
    }
  }

  if (messages.length === 0) {
    add(messages, "PASS", `${filePath} existe e contém as chaves obrigatórias`);
  }

  return messages;
}

function canHttpProbe(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function httpProbe(url: string): StatusMessage {
  if (!canHttpProbe(url)) {
    return {level: "WARN", message: `Não é possível testar URL não HTTP: ${url}`};
  }

  try {
    execSync(`wget -q --spider --timeout=4 --tries=1 "${url}"`, {stdio: "pipe"});
    return {level: "PASS", message: `Acessível: ${url}`};
  } catch {
    return {level: "WARN", message: `Sem acesso no momento: ${url}`};
  }
}

function evaluateConnections(env: ToolsEnv): StatusMessage[] {
  const messages: StatusMessage[] = [];
  const prodCaddyPath = getPathFromMonorepo("environments/production/Caddyfile");

  if (!fileExists("environments/tools/.env")) {
    add(messages, "FAIL", "environments/tools/.env não encontrado");
    return messages;
  }

  add(messages, "PASS", "environments/tools/.env encontrado");

  if (env.ACTIVE_REVERSE_PROXY) {
    if (!env.PUBLIC_BASE_URL) {
      add(messages, "FAIL", "PUBLIC_BASE_URL é obrigatório quando ACTIVE_REVERSE_PROXY=true");
    } else {
      add(messages, "PASS", `PUBLIC_BASE_URL configurado: ${env.PUBLIC_BASE_URL}`);
      messages.push(httpProbe(env.PUBLIC_BASE_URL));
    }

    if (!fs.existsSync(prodCaddyPath)) {
      add(messages, "FAIL", "Caddyfile de produção não encontrado");
    } else {
      const caddy = fs.readFileSync(prodCaddyPath, "utf8");
      const hasApp = caddy.includes("/app*");
      const hasChat = caddy.includes("/chat*");
      if (hasApp && hasChat) {
        add(messages, "PASS", "Caddyfile de produção contém rotas /app e /chat");
      } else {
        add(messages, "FAIL", "Caddyfile de produção sem rota esperada /app* ou /chat*");
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
        add(messages, "FAIL", "REMOTE_API_BASE_URL é obrigatório quando API_MODE=remote");
      } else {
        add(messages, "PASS", `REMOTE_API_BASE_URL configurado: ${env.REMOTE_API_BASE_URL}`);
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
        "A API não faz parte de environments/production/docker-compose.yml; inicie em um deploy separado, se necessário."
      );
    }
  }

  if (env.ACTIVE_CHATBOT) {
    if (env.CHATBOT_MODE === "remote") {
      if (!env.REMOTE_CHATBOT_BASE_URL) {
        add(messages, "FAIL", "REMOTE_CHATBOT_BASE_URL é obrigatório quando CHATBOT_MODE=remote");
      } else {
        add(messages, "PASS", `REMOTE_CHATBOT_BASE_URL configurado: ${env.REMOTE_CHATBOT_BASE_URL}`);
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
  console.log("Componentes ativos:");
  console.log(`- ui: ${env.ACTIVE_UI}`);
  console.log(`- proxy-reverso(caddy): ${env.ACTIVE_REVERSE_PROXY}`);
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
  console.log("Verificações:");
  for (const c of checks) {
    console.log(`${levelPrefix(c.level)} ${c.message}`);
  }

  const failCount = checks.filter((c) => c.level === "FAIL").length;
  const warnCount = checks.filter((c) => c.level === "WARN").length;
  console.log("");
  console.log(`Resumo: ${failCount} falha(s), ${warnCount} aviso(s), ${checks.length - failCount - warnCount} ok`);
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
    console.log("Nenhum serviço de produção selecionado em tools/.env.");
    return;
  }

  console.log(`Iniciando serviços de produção: ${services.join(", ")}`);
  runCompose("up -d --build", services);
}

export function runDown(): void {
  const env = loadToolsEnv();
  const services = collectProductionServices(env);
  if (services.length === 0) {
    console.log("Nenhum serviço de produção selecionado em tools/.env.");
    return;
  }

  console.log(`Parando/removendo serviços de produção selecionados: ${services.join(", ")}`);
  runCompose("rm -s -f", services);
}
