import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir, note } from "./config";
import { entitify, writeOutput } from "./utils";
import { rcompare } from "semver";
import type { PackageData, TableData, TableMetadata } from "./types";

/**
 * Parse changelog content into individual releases
 */
function parseChangelog(
	changelog: string,
): Array<{ version: string; notes: string }> {
	// maybe json parse is escaping some characters

	const nonEscaped = changelog.split("## [");
	const escaped = changelog.split("## \\[");
	let valid = escaped;
	if (nonEscaped.length > escaped.length) {
		valid = nonEscaped;
	}

	return valid
		.filter((item) => !item.includes("# Changelog"))
		.map((section) => {
			const [version, ...c] = section.split("\n");
			if (!version) {
				return null;
			}
			const contents = c.join("\n");
			return {
				version: version.replace("\\[", "").replace("]", ""),
				notes: contents,
			};
		})
		.filter((r): r is { version: string; notes: string } => r !== null)
		.filter(({ version }) => !version.includes("Not Published"));
}

/**
 * Generate an individual page for each version
 */
function generateVersionPage(params: {
	packageName: string;
	version: string;
	notes: string;
	// todo: fix tag url
	tag: string;
	workingDir: string;
	order: number;
}): void {
	const { packageName, version, notes, tag, workingDir, order } = params;
	const pageFrontmatter = [
		note,
		`title: '${packageName}@${version}'`,
		`sidebar: '${version}'`,
		`description: '${version}'`,
		`order: ${order}`,
	];

	const frontmatter = ["---", ...pageFrontmatter, "---"].join("\n");
	const header = `<ReleaseHeader href="${tag}/${packageName}-v${version}" />`;

	const tags = ["# {{ $frontmatter.title }}"].join("\n\n");

	const content = `${frontmatter}\n\n${header}\n\n${tags}\n\n${notes}`;
	const fileName = `v${version}.md`;

	writeFileSync(join(workingDir, fileName), content);
}

function generateAllVersionsPage(params: {
	packageName: string;
	content: string;
	url: string;
	workingDir: string;
}): void {
	const { packageName, content, url, workingDir } = params;
	const frontmatter = [
		note,
		`title: '${packageName} - full changelog'`,
		`sidebar: 'Full Changelog'`,
		`description: 'All changelog entries for ${packageName}'`,
		"order: 0",
	];

	// todo: fix tag url - should point either to the current release or the full changelog if the all version page
	const header = `<ReleaseHeader href="${url}" />`;
	const tags = ["# {{ $frontmatter.title }}"].join("\n\n");

	const fileContent = `${["---", ...frontmatter, "---"].join("\n")}\n\n${header}\n\n${tags}${content}`;
	writeFileSync(join(workingDir, "all_versions.md"), fileContent);
}

/**
 * Generate an index page with links to all packages
 */
function generateIndexPage(packages: string[]): void {
	const indexPath = join(baseDir, "index.md");
	mkdirSync(join(baseDir), { recursive: true });

	const packageLinks = packages
		.map((pkg) => `- [${pkg}](/${pkg}/all_versions.html)`)
		.join("\n");

	// todo: generate summary table either in md or component
	const indexPage = [
		"---",
		note,
		`layout: home`,
		`title: 'Tauri Releases'`,
		"---",
		"",
		"# Tauri Releases",
		"",
		"## Packages",
		"",
		"<SummaryTable/>",
		"",
		packageLinks,
	].join("\n");

	writeFileSync(indexPath, indexPage);
}

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
		const releases = parseChangelog(data.changelogs);
		if (releases.length === 0) {
			console.warn(`missing releases ${packageName}`);
			return;
		}

		releases.sort((a, b) => {
			return rcompare(b.version, a.version);
		});

		const allContent: string[] = [];

		releases.forEach((release, i) => {
			const { version, notes } = release;
			const { npmData, cratesData } = data;
			const processedNotes = entitify(notes);

			allContent.unshift(`\n\n## v${version}\n\n${processedNotes}`);

			generateVersionPage({
				packageName,
				version,
				notes: processedNotes,
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

			tableRows.push(
				generateTableRow({
					packageName,
					version,
					date,
					changelog: processedNotes,
					repo,
				}),
			);
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
	generateTableData(tableRows, tableMetadata);
	//

	console.log(
		`Generated pages for ${packageNames.length} packages in ${outputDir}`,
	);
}

function generateTableRow(params: {
	packageName: string;
	repo: string;
	version: string;
	changelog: string;
	date: string | undefined;
}): TableData {
	const { packageName, version, date, changelog, repo } = params;
	return {
		name: packageName,
		repo,
		version,
		changelog,
		date: date || "-",
	};
}

function generateTableData(
	tableData: TableData[],
	tableMetadata: TableMetadata,
): void {
	writeOutput(
		{ tableMetadata, tableData: tableData.reverse() },
		"tableData.json",
	);
}
