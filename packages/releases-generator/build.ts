import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { rcompare } from "semver";
import { repositories } from "./config";
import { entitify } from "./utils";
import type { Repository } from "./types";

const note =
	"\n# NOTE: This file is auto-generated in packages/releases-generator/build.ts based on releases on GitHub";

const baseDir = "../../src/content";

const latestVersions: {
	[key: string]: string;
} = {};

function getAllPackages() {
	const allPackages = [];

	for (const repo of repositories) {
		const [owner, repoName] = repo.repoUrl
			.replace("https://github.com/", "")
			.split("/");
		const rawContentUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/dev`;

		for (const pkg of repo.packages) {
			const changelogPath = pkg.path
				? `${pkg.path}/CHANGELOG.md`
				: "CHANGELOG.md";
			const changelogUrl = `${rawContentUrl}/${changelogPath}`;

			allPackages.push({
				name: pkg.name,
				changelog: changelogUrl,
				tag: `${repo.repoUrl}/releases/tag`,
				repoUrl: repo.repoUrl,
				description: pkg.description,
				source: pkg.source,
				packageUrl: pkg.packageUrl,
			});
		}
	}
	return allPackages;
}

const packages = getAllPackages();

writeFileSync(
	join(baseDir, "packages.json"),
	JSON.stringify(packages, null, 2),
);

async function generator() {
	for (const pkg of packages) {
		const response = await fetch(pkg.changelog.trim());
		const responseText: string = await response.text();
		const releases = responseText
			.split("## \\[")
			.filter((item) => !item.includes("# Changelog"))
			.map((section) => {
				const [version, ...c] = section.split("\n");
				const contents = c.join("\n");
				return {
					version: version.replace("\\[", "").replace("]", ""),
					notes: contents,
				};
			})
			.filter(({ version }) => !version.includes("Not Published"));

		mkdirSync(join(baseDir, pkg.name), { recursive: true });

		releases.sort((a, b) => {
			return rcompare(a.version, b.version);
		});
		//
		/*
		 * Write files for each version
		 */
		const len = releases.length;
		for (let i = 0; i < len; i++) {
			const thisVersion = releases[i].version;

			if (i === 0) {
				// latest version
				latestVersions[pkg.name] = `v${thisVersion}`;
			}
			//
			const pageFrontmatter = [
				note,
				`title: '${pkg.name}@${thisVersion}'`,
				`description: '${thisVersion}'`,
				// `slug: 'release/${pkg.name}/v${thisVersion}'`,
				// "tableOfContents: false",
				`editUrl: 'https://github.com/tauri-apps/tauri-docs/packages/releases-generator/build.ts'`,
				// "pagefind: false",
				// "sidebar:",
				// `  label: ${thisVersion}`,
				`order: ${i}`,
			];

			const frontmatter = ["---", ...pageFrontmatter, "---"].join("\n");
			const header = `<ReleaseHeader href="${pkg.tag}/${pkg.name}-v${thisVersion}" />`;

			const basePath = join(baseDir, pkg.name);

			writeFileSync(
				join(basePath, `v${thisVersion}.md`),
				`${frontmatter}\n\n${header}\n${entitify(releases[i].notes)}`,
			);
		}

		const allFrontmatter = [
			note,
			`title: '${pkg.name} – All Releases'`,
			`description: 'All changelog entries for ${pkg.name}'`,
			`editUrl: 'https://github.com/tauri-apps/tauri-docs/packages/releases-generator/build.ts'`,
			"order: 0",
		];
		const allHeader = `<ReleaseHeader href="${pkg.repoUrl} />`;
		let allContent = `${allHeader}\n`;
		for (const rel of releases) {
			allContent += `\n\n## v${rel.version}\n\n${entitify(rel.notes)}`;
		}
		writeFileSync(
			join(baseDir, pkg.name, "All Versions.md"),
			`${["---", ...allFrontmatter, "---"].join("\n")}\n\n${allContent}`,
		);
	}

	// Generate index page
	const extraNote =
		"# To quickly preview changes, you can edit this file, then make sure you copy the changes over the source build.ts script\n";
	const indexPage = [
		"---",
		note,
		extraNote,
		`title: 'Tauri Core Ecosystem Releases'`,
		"---",
	].join("\n");

	const releasesTable = generateReleaseTables(repositories);

	const indexPageContent = releasesTable;

	writeFileSync(
		join(baseDir, "index.md"),
		`${indexPage}\n\n${indexPageContent}`,
	);
}

function generateReleaseTables(repositories: Repository[]): string {
	let markdownOutput = "";

	for (const repo of repositories) {
		// summary table header
		const repoSlug = repo.repoUrl
			.replace("https://github.com/", "")
			.replace(/\/$/, "");
		markdownOutput += `### ${repo.displayName} [${repoSlug}](${repo.repoUrl})\n\n`;
		markdownOutput += "| Component | Description | Version |\n";
		markdownOutput += "|-----------|-------------|---------|\n";

		for (const pkg of repo.packages) {
			const packageNameLink = `[**${pkg.name}**](${pkg.packageUrl})`;
			const versionBadge = `[![${pkg.name} version badge](https://img.shields.io/${pkg.source}/v/${pkg.name}.svg)](${pkg.packageUrl})`;

			markdownOutput += `| ${packageNameLink} | ${pkg.description} | ${versionBadge} |\n`;
		}
		markdownOutput += "\n";
	}

	return markdownOutput.trim();
}

generator();
