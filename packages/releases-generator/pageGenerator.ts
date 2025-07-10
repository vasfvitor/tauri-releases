import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir, note } from "./config";
import { entitify } from "./utils";
import { rcompare } from "semver";
import type { PackageData } from "./types";

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
function generateVersionPage(
	packageName: string,
	version: string,
	notes: string,
	tag: string,
	workingDir: string,
	order: number,
): void {
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

/**
 * Generate a page containing all versions
 */
function generateAllVersionsPage(
	packageName: string,
	content: string,
	url: string,
	workingDir: string,
): void {
	const frontmatter = [
		note,
		`title: '${packageName} - full changelog'`,
		`sidebar: 'Full Changelog'`,
		`description: 'All changelog entries for ${packageName}'`,
		"order: 0",
	];
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

	const indexPage = [
		"---",
		note,
		`title: 'Tauri Core Ecosystem Releases'`,
		"---",
		"",
		"# Tauri Core Ecosystem Releases",
		"",
		"## Packages",
		"",
		"<ReleasesTable/>",
		"",
		packageLinks,
	].join("\n");

	writeFileSync(indexPath, indexPage);
}

/**
 * Main function to generate all frontend pages from PackageData
 */
export function generatePages(
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
			const processedNotes = entitify(notes);

			allContent.unshift(`\n\n## v${version}\n\n${processedNotes}`);

			generateVersionPage(
				packageName,
				version,
				processedNotes,
				data.npmData?.name || data.cratesData?.name || packageName,
				workingDir,
				releases.length - i,
			);
		});

		generateAllVersionsPage(
			packageName,
			allContent.join(""),
			data.npmData?.name || data.cratesData?.name || packageName,
			workingDir,
		);
	});

	generateIndexPage(packageNames);

	console.log(
		`Generated pages for ${packageNames.length} packages in ${outputDir}`,
	);
}
