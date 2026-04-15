import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repositories } from "./config.js";
import { fetchData } from "./dataFetch.js";
import { generatePagesAndTableData } from "./pageGenerator.js";
import type { PackageData } from "./types.js";
import { writeOutput } from "./utils.js";

async function buildSite() {
  const dataFilePath = join("generated", "data.json");
  let packageData: PackageData;

  if (existsSync(dataFilePath)) {
    const rawData = readFileSync(dataFilePath, "utf-8");
    packageData = JSON.parse(rawData);
  } else {
    packageData = await fetchData(repositories);
    writeOutput(packageData, "data.json");
  }

  try {
    await generatePagesAndTableData(packageData);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

buildSite().catch((error) => {
  console.error(error);
  process.exit(1);
});
