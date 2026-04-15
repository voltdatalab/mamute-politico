import {z} from "zod";

const boolFromEnv = z
  .string()
  .optional()
  .transform((v) => String(v ?? "false").toLowerCase() === "true");

export const toolsEnvSchema = z.object({
  ACTIVE_UI: boolFromEnv,
  ACTIVE_REVERSE_PROXY: boolFromEnv,
  ACTIVE_API: boolFromEnv,
  API_MODE: z.enum(["all_together", "remote"]).optional().default("all_together"),
  REMOTE_API_BASE_URL: z.string().optional().default(""),
  ACTIVE_CHATBOT: boolFromEnv,
  CHATBOT_MODE: z.enum(["all_together", "remote"]).optional().default("all_together"),
  REMOTE_CHATBOT_BASE_URL: z.string().optional().default(""),
  ACTIVE_GHOST: boolFromEnv,
  PUBLIC_BASE_URL: z.string().optional().default("")
});

export type ToolsEnv = z.infer<typeof toolsEnvSchema>;

export type StatusLevel = "PASS" | "WARN" | "FAIL";

export type StatusMessage = {
  level: StatusLevel;
  message: string;
};
