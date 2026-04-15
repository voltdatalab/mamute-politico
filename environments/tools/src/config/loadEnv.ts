import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import {toolsEnvSchema, type ToolsEnv} from "./schema.js";

export const toolsDirInContainer = "/workspace/tools";
const monorepoRoot = path.resolve(toolsDirInContainer, "..", "..");

export function getPathFromMonorepo(relativePath: string): string {
  return path.resolve(monorepoRoot, relativePath);
}

export function loadRawEnvFile(): Record<string, string> {
  const envPath = path.join(toolsDirInContainer, ".env");
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, "utf8");
  return dotenv.parse(content);
}

export function loadToolsEnv(): ToolsEnv {
  const parsed = toolsEnvSchema.safeParse(loadRawEnvFile());
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`tools/.env inválido: ${details}`);
  }

  return parsed.data;
}

export function fileExists(relativePath: string): boolean {
  return fs.existsSync(getPathFromMonorepo(relativePath));
}

export function parseEnvFile(relativePath: string): Record<string, string> {
  const absolutePath = getPathFromMonorepo(relativePath);
  if (!fs.existsSync(absolutePath)) {
    return {};
  }

  return dotenv.parse(fs.readFileSync(absolutePath, "utf8"));
}
