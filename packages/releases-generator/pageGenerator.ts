import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir } from "./config";
import { createWriteStream } from "node:fs";
import { parseMarkdown } from "./utils";
import type { PackageData, TableData, TableMetadata } from "./types";
import {
	writeVersionPage,
	writeAllVersionsPage,
	writeIndexPage,
} from "./scripts/writePage";
import { parseAndSortChangelog } from "./scripts/parse";

export async function generatePagesAndTableData(
	packageData: PackageData,
	outputDir: string = baseDir,
) {
	console.log("generating table...");
	await writeTableData(packageData);
	console.log("generating pages...");
	writePageData(packageData, outputDir);
}

export function writePageData(
	packageData: PackageData,
	outputDir: string = baseDir,
): void {
	const packageNames: string[] = [];

	Object.entries(packageData).forEach(([packageName, data]) => {
		const fullName = `${data.group || ""}/${packageName}`;

		packageNames.push(fullName);

		const workingDir = join(outputDir, fullName);
		mkdirSync(workingDir, { recursive: true });

		if (!data.changelogs) {
			console.warn(`missing changelog ${packageName}`);
		}
		const releases = parseAndSortChangelog(data.changelogs);
		if (releases.length === 0) {
			console.warn(`missing releases ${packageName}`);
		}

		const allContent: string[] = [];

		releases.forEach((release, i) => {
			const { version, notes } = release;
			const rawMd = parseMarkdown(notes, "markdown");

			allContent.push(`\n\n## v${version}\n\n${rawMd}`);

			writeVersionPage({
				packageName,
				version,
				notes: rawMd,
				// todo: fix tag url - should point either to the current release or the full changelog if the all version page
				tag: packageName,
				workingDir,
				order: releases.length - i,
			});
		});

		writeAllVersionsPage({
			packageName,
			content: allContent.reverse().join(""),
			// todo: fix tag url -
			url: data.npmData?.name || data.cratesData?.name,
			workingDir,
		});
	});

	writeIndexPage(packageNames);
}

export async function writeTableData(packageData: PackageData): Promise<void> {
	const tableMetadata: TableMetadata = {
		packages: {},
		repoList: [],
	};
	const repoList = new Set<string>();

	const tableDataPath = join("generated", "tableData.json");

	const stream = createWriteStream(tableDataPath);

	stream.write('{\n"tableMetadata": ');

	Object.entries(packageData).forEach(([packageName, data]) => {
		const key = data.group || packageName;
		if (!tableMetadata.packages[key]) {
			tableMetadata.packages[key] = [];
		}
		(tableMetadata.packages[key] as string[]).push(packageName);
		repoList.add(data.group || packageName);
	});
	tableMetadata.repoList = Array.from(repoList);

	stream.write(JSON.stringify(tableMetadata, null, 2));
	// open
	stream.write(',\n"tableData": [');

	let isFirst = true;

	for (const [packageName, data] of Object.entries(packageData)) {
		const repo = data.group || packageName;

		if (!data.changelogs) {
			console.warn(`missing changelog ${packageName}`);
		}

		const releases = parseAndSortChangelog(data.changelogs);

		if (releases.length === 0) {
			console.warn(`missing releases ${packageName}`);
		}

		for (const release of releases) {
			if (!isFirst) {
				stream.write(",");
			}

			const { version, notes } = release;
			const { npmData, cratesData } = data;
			const parsedMd = parseMarkdown(notes, "html");

			let date: string | undefined;
			if (npmData?.versions?.[version]) {
				date = data.npmData.versions[version];
			}
			if (!date && cratesData?.versions?.[version]) {
				date = data.cratesData.versions[version];
			}

			const row = {
				name: packageName,
				repo,
				version,
				changelog: parsedMd,
				date: date || "-",
			};
			stream.write(JSON.stringify(row));
			isFirst = false;
		}
	}
	// close
	stream.write("]\n}");
	stream.end();
}
