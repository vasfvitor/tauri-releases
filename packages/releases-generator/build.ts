import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fetchData, writeOutputToJson } from "./dataFetch";
import { repositories } from "./config";
import type { PackageData } from "./dataFetch";
import { generatePages } from "./pageGenerator";

async function buildSite() {
	const dataFilePath = join("generated", "data.json");
	let packageData: PackageData;

	if (existsSync(dataFilePath)) {
		const rawData = readFileSync(dataFilePath, "utf-8");
		packageData = JSON.parse(rawData);
	} else {
		packageData = await fetchData(repositories);
		writeOutputToJson(packageData);
	}
	console.log("generating pages...");
	generatePages(packageData);
}

buildSite().catch((error) => {
	console.error(error);
	process.exit(1);
});
