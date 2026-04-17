import {z} from "zod";

const boolFromEnv = z
  .string()
  .optional()
  .transform((v) => String(v ?? "false").toLowerCase() === "true");

export const toolsEnvSchema = z.object({
  ACTIVE_APP_STACK: boolFromEnv,
  ACTIVE_SCRAPPERS: boolFromEnv,
  ACTIVE_DATABASE: boolFromEnv,
  API_MODE: z.enum(["all_together", "remote"]).optional().default("all_together"),
  REMOTE_API_BASE_URL: z.string().optional().default(""),
  CHATBOT_MODE: z.enum(["all_together", "remote"]).optional().default("all_together"),
  REMOTE_CHATBOT_BASE_URL: z.string().optional().default(""),
  PUBLIC_BASE_URL: z.string().optional().default("")
});

export type ToolsEnv = z.infer<typeof toolsEnvSchema>;

export type StatusLevel = "PASS" | "WARN" | "FAIL";

export type StatusMessage = {
  level: StatusLevel;
  message: string;
};
