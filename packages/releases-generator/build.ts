import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fetchData } from "./dataFetch";
import { repositories } from "./config";
import { generatePages } from "./pageGenerator";
import type { PackageData, TablePackageData } from "./types";
import { writeOutput } from "./utils";

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

	const tableData = getTableData(packageData);

	writeOutput(tableData, "tableData.json");

	console.log("generating pages...");
	generatePages(packageData);
}

buildSite().catch((error) => {
	console.error(error);
	process.exit(1);
});

function getTableData(packageData: PackageData) {
	const tableData: TablePackageData[] = [];
	const packageList = {};

	for (const [packageName, pkg] of Object.entries(packageData)) {
		const repo = pkg.group || packageName;
		tableData.push({
			name: packageName,
			group: pkg.group || "",
			changelogs: pkg.changelogs,
			npmData: pkg.npmData,
			cratesData: pkg.cratesData,
		});
		if (!packageList[repo]) {
			packageList[repo] = [];
		}
		packageList[repo].push(packageName);
	}

	return {
		tableMetadata: {
			packageList,
			repoList: Object.keys(packageList).sort(),
		},
		tableData,
	};
}
