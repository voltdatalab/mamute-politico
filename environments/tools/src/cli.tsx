import {runSetup} from "./modes/setup.js";
import {runDown, runStatus, runUp} from "./modes/status.js";

async function main(): Promise<void> {
  const mode = process.argv[2] ?? "status";

  if (mode === "setup") {
    await runSetup();
    return;
  }

  if (mode === "status") {
    runStatus();
    return;
  }

  if (mode === "up") {
    runUp();
    return;
  }

  if (mode === "down") {
    runDown();
    return;
  }

  console.error(`Modo desconhecido: ${mode}`);
  console.error("Modos válidos: setup, status, up, down");
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Erro ao executar ferramenta: ${message}`);
  process.exitCode = 1;
});
