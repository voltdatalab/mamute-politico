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

  console.error(`Unknown mode: ${mode}`);
  console.error("Valid modes: setup, status, up, down");
  process.exitCode = 1;
}

await main();
