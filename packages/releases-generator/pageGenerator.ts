import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir } from "./config.js";
import { parseAndSortChangelog } from "./scripts/parse.js";
import {
	getAllVersionsHead,
	writeIndexPage,
	writeVersionPage,
} from "./scripts/writePage.js";
import type { PackageData, TableMetadata } from "./types.js";
import { parseMarkdown } from "./utils.js";

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

		const allVersionsStream = createWriteStream(
			join(workingDir, "all_versions.md"),
		);

		// todo: fix tag url -
		const url = data.npmData?.name || data.cratesData?.name;
		allVersionsStream.write(getAllVersionsHead(packageName, url));

		releases.forEach((release, i) => {
			const { version, notes } = release;
			const rawMd = parseMarkdown(notes, "markdown");

			allVersionsStream.write(`\n\n## v${version}\n\n${rawMd}`);

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

		allVersionsStream.end();
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
