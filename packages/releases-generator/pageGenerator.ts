import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir } from "./config";
import { parseMarkdown, writeOutput } from "./utils";
import type { PackageData, TableData, TableMetadata } from "./types";
import {
	generateVersionPage,
	generateAllVersionsPage,
	generateIndexPage,
} from "./scripts/generatePage";
import { parseAndSortChangelog } from "./scripts/parse";

/**
 * Main function to generate all frontend pages from PackageData
 */
export function generatePagesAndTableData(
	packageData: PackageData,
	outputDir: string = baseDir,
): void {
	const packageNames: string[] = [];
	const tableRows: TableData[] = [];
	const tableMetadata: TableMetadata = {
		packages: {},
		repoList: [],
	};
	const repoList = new Set<string>();

	Object.entries(packageData).forEach(([packageName, data]) => {
		// table stuff
		const key = data.group || packageName;
		if (!tableMetadata.packages[key]) {
			tableMetadata.packages[key] = [];
		}
		// @ts-expect-error
		tableMetadata.packages[key].push(packageName);
		const repo = data.group || packageName;
		repoList.add(repo);
		//

		const fullName = `${data.group || ""}/${packageName}`;

		packageNames.push(fullName);

		const workingDir = join(outputDir, fullName);
		mkdirSync(workingDir, { recursive: true });

		if (!data.changelogs) {
			console.warn(`missing changelog ${packageName}`);
			return;
		}
		const releases = parseAndSortChangelog(data.changelogs);
		if (releases.length === 0) {
			console.warn(`missing releases ${packageName}`);
			return [];
		}

		const allContent: string[] = [];

		releases.forEach((release, i) => {
			const { version, notes } = release;
			const { npmData, cratesData } = data;
			const { rawMd, parsedMd } = parseMarkdown(notes);

			allContent.unshift(`\n\n## v${version}\n\n${rawMd}`);

			generateVersionPage({
				packageName,
				version,
				notes: rawMd,
				// todo: fix tag url - should point either to the current release or the full changelog if the all version page
				tag: packageName,
				workingDir,
				order: releases.length - i,
			});

			// table stuff
			let date: string | undefined;
			if (npmData?.versions?.[version]) {
				date = data.npmData.versions[version];
			}
			if (!date && cratesData?.versions?.[version]) {
				date = data.cratesData.versions[version];
			}

			tableRows.push({
				name: packageName,
				repo,
				version,
				changelog: parsedMd,
				date: date || "-",
			});
			//
		});

		generateAllVersionsPage({
			packageName,
			content: allContent.join(""),
			// todo: fix tag url -
			url: data.npmData?.name || data.cratesData?.name,
			workingDir,
		});
	});

	generateIndexPage(packageNames);

	// table stuff
	tableMetadata.repoList = Array.from(repoList);
	const tableData: { tableData: TableData[]; tableMetadata: TableMetadata } = {
		// reverse to order versions
		tableData: tableRows.reverse(),
		tableMetadata,
	};
	writeOutput(tableData, "tableData.json");
	//

	console.log(
		`Generated pages for ${packageNames.length} packages in ${outputDir}`,
	);
}
