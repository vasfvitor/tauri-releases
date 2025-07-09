import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageData, TablePackageData } from "./types";

export function entitify(str: string): string {
	return str
		.replace(/[&<>"']/g, (entity) => {
			switch (entity) {
				case "&":
					return "&amp;";
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case '"':
					return "&quot;";
				case "'":
					return "&#39;";
				default:
					return entity;
			}
		})
		.replace(/\$\{/g, "$\\{");
}

export function flatten(packageData: PackageData): TablePackageData[] {
	return Object.entries(packageData).map(([packageName, data]) => ({
		packageName,
		group: data.group,
		changelogs: data.changelogs,
		npmData: data.npmData,
		cratesData: data.cratesData,
	}));
}

export function writeOutputToJson(
	output: PackageData | TablePackageData[],
	fileName: string,
): void {
	const path = "generated";
	mkdirSync(path, { recursive: true });
	const filePath = join(path, fileName);
	writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");

	console.log(`done: ${filePath}`);
}
