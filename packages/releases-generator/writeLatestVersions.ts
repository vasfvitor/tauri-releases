import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { buildLatestVersions, formatLatestVersionsModule } from "./uiData.js";
import type { PackageData } from "./types.js";

export function writeLatestVersions(
  packageData: PackageData,
  outputDir = ".",
): void {
  const latestVersions = buildLatestVersions(packageData);
  const generatedDir = join(outputDir, "generated");
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(
    join(generatedDir, "latestVersions.ts"),
    formatLatestVersionsModule(latestVersions),
    "utf-8",
  );
}
