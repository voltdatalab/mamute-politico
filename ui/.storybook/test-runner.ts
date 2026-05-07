import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext, waitForPageReady } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const snapshotsDir = path.resolve(__dirname, "..", ".storybook-visual", "snapshots");

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async preVisit(page) {
    await page.setViewportSize({ width: 1280, height: 900 });
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (
      storyContext.parameters?.screenshot?.disable === true ||
      storyContext.tags?.includes("skip-snapshot") === true
    ) {
      return;
    }

    await waitForPageReady(page);
    const root = page.locator("#storybook-root");
    await root.waitFor({ state: "visible", timeout: 15_000 });
    const image = await root.screenshot({
      animations: "disabled",
    });

    expect(Buffer.from(image)).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: context.id,
      failureThreshold: 0.02,
      failureThresholdType: "percent",
    });
  },
};

export default config;
