import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repositories } from "./config.js";
import { fetchData } from "./dataFetch.js";
import { generatePagesAndTableData } from "./pageGenerator.js";
import type { PackageData } from "./types.js";
import { writeOutput } from "./utils.js";

async function buildSite() {
  const dataFilePath = join("generated", "data.json");
  let packageData: PackageData;

  if (process.argv.includes("--refresh")) {
    packageData = await fetchData(repositories);
    writeOutput(packageData, "data.json");
  } else {
    try {
      packageData = JSON.parse(readFileSync(dataFilePath, "utf-8"));
      console.log("Skipping versions fetch - data.json already exists");
    } catch (error) {
      throw error;
    }
  }

  await generatePagesAndTableData(packageData);
}

buildSite().catch((error) => {
  console.error(error);
  process.exit(1);
});
