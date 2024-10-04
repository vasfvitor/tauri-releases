// todo: add repo url and replace tag with /releases/tag and fix the table

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { rcompare } from "semver";

const note =
	"\n# NOTE: This file is auto-generated in packages/releases-generator/build.ts based on Tauri releases on GitHub";
const packages = [
	{
		name: "tauri",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
		repoUrl: "https://github.com/tauri-apps/tauri/",
		description: "runtime core",
		source: "crates",
		packageUrl: "https://crates.io/crates/tauri",
	},
	{
		name: "@tauri-apps/api",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/tauri/dev/packages/api/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
		description: "JS API for interaction with Rust backend",
		source: "npm",
		packageUrl: "https://www.npmjs.com/package/@tauri-apps/api",
	},
	{
		name: "tauri-cli",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
		description: "create, develop and build apps",
		source: "crates",
		packageUrl: "https://crates.io/crates/tauri-cli",
	},
	{
		name: "@tauri-apps/cli",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/tauri/dev/packages/cli/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
		description: "Node.js CLI wrapper for `tauri-cli`",
		source: "npm",
		packageUrl: "https://www.npmjs.com/package/@tauri-apps/cli",
	},
	{
		name: "tauri-bundler",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-bundler/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
		description: "manufacture the final binaries",
		source: "crates",
		packageUrl: "https://crates.io/crates/tauri-bundler",
	},
	{
		name: "wry",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/wry/dev/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/wry/releases/tag",
		description: "enables webview and native integration",
		source: "crates",
		packageUrl: "https://crates.io/crates/wry",
	},
	{
		name: "tao",
		changelog:
			"https://raw.githubusercontent.com/tauri-apps/tao/dev/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tao/releases/tag",
		description: "abstracts over OS-specific APIs",
		source: "crates",
		packageUrl: "https://crates.io/crates/tao",
	},
	{
		name: "create-tauri-app",
		changelog:
			"	https://raw.githubusercontent.com/tauri-apps/create-tauri-app/dev/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/create-tauri-app/releases/tag",
		description: "get started with your first Tauri app",
		source: "npm",
		packageUrl: "https://www.npmjs.com/package/create-tauri-app",
	},
];

type Package = (typeof packages)[0];

const baseDir = "../../src/content";

const latestVersions: {
	[key: string]: string;
} = {};

async function generator() {
	for (const pkg of packages) {
		const response = await fetch(pkg.changelog);
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

	const releasesTable = generateReleaseTable(packages);

	const indexPageContent = releasesTable;

	writeFileSync(
		join(baseDir, "index.md"),
		`${indexPage}\n\n${indexPageContent}`,
	);
}

function generateReleaseTable(packages: Package[]) {
	let table = `
| Component | Description | Version |
|-----------|-------------|---------|
`;

	for (const pkg of packages) {
		table += `| [**${pkg.name}**](${pkg.tag}) | ${pkg.description} | [![${pkg.name} version badge](https://img.shields.io/${pkg.source}/v/${pkg.name}.svg)](${pkg.packageUrl}}) |\n`;
	}

	return table;
}

function entitify(str: string): string {
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

generator();
