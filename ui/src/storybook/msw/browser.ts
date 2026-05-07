import { setupWorker } from "msw/browser";
import { storybookHandlers } from "./handlers";

export const storybookWorker = setupWorker(...storybookHandlers);

let started = false;

export async function startStorybookMsw() {
  if (started) return storybookWorker;
  await storybookWorker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
  started = true;
  return storybookWorker;
}
