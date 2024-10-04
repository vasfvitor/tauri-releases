import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { rcompare } from "semver";

const note =
	"\n# NOTE: This file is auto-generated in packages/releases-generator/build.ts based on Tauri releases on GitHub";
const packages = [
	{
		name: "tauri",
		url: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
	},
	{
		name: "@tauri-apps/api",
		url: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/packages/api/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
	},
	{
		name: "tauri-cli",
		url: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-cli/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
	},
	{
		name: "@tauri-apps/cli",
		url: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/packages/cli/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
	},
	{
		name: "tauri-bundler",
		url: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-bundler/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tauri/releases/tag",
	},
	{
		name: "wry",
		url: "https://raw.githubusercontent.com/tauri-apps/wry/dev/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/wry/releases/tag",
	},
	{
		name: "tao",
		url: "https://raw.githubusercontent.com/tauri-apps/tao/dev/CHANGELOG.md",
		tag: "https://github.com/tauri-apps/tao/releases/tag",
	},
];

const baseDir = "../../src/content";

const latestVersions: {
	[key: string]: string;
} = {};

async function generator() {
	for (const pkg of packages) {
		const response = await fetch(pkg.url);
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
			/**
			 * Deal with next-prev labels
			 */
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
		"# To quickly preview changes, you can edit this file, them make sure you copy the changes over the source build.ts script\n";
	const indexPage = [
		"---",
		note,
		extraNote,
		`title: 'Tauri Core Ecosystem Releases'`,
		"---",
	].join("\n");

	const links = [
		{ title: "tauri", key: "tauri" },
		{ title: "@tauri-apps/api", key: "@tauri-apps/api" },
		{ title: "tauri-cli (Rust)", key: "tauri-cli" },
		{ title: "@tauri-apps/cli (JavaScript)", key: "@tauri-apps/cli" },
		{ title: "tauri-bundler", key: "tauri-bundler" },
		{ title: "wry", key: "wry" },
		{ title: "tao", key: "tao" },
	];
	const generateLinkCards = (
		links: any[],
		latestVersions: { [x: string]: any },
	) => {
		return links
			.map(
				(link) =>
					`[${link.title}](/${link.key}/${latestVersions[link.key]}/)\n`,
			)
			.join("\n");
	};

	// export const latestVersions = ${JSON.stringify(latestVersions)};

	// export const links = ${JSON.stringify(links)};

	const indexPageContent = generateLinkCards(links, latestVersions);

	writeFileSync(
		join(baseDir, "index.md"),
		`${indexPage}\n\n${indexPageContent}`,
	);
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
