import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fetchData } from "./dataFetch";
import { repositories } from "./config";
import { generatePages } from "./pageGenerator";
import type { PackageData } from "./types";
import { flatten, writeOutputToJson } from "./utils";

async function buildSite() {
	const dataFilePath = join("generated", "data.json");
	let packageData: PackageData;

	if (existsSync(dataFilePath)) {
		const rawData = readFileSync(dataFilePath, "utf-8");
		packageData = JSON.parse(rawData);
	} else {
		packageData = await fetchData(repositories);
		writeOutputToJson(packageData, "data.json");
	}

	const tablePackageData = flatten(packageData);
	writeOutputToJson(tablePackageData, "tableData.json");

	console.log("generating pages...");
	generatePages(packageData);
}

buildSite().catch((error) => {
	console.error(error);
	process.exit(1);
});
