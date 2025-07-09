import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { rcompare } from "semver";
import { baseDir, note } from "./config";
import type { Package, Release } from "./types";
import { entitify } from "./utils";

const latestVersions: { [key: string]: string } = {};

export async function generateVersionPages(packages: Package[]) {
	for (const pkg of packages) {
		const workingDir = join(baseDir, pkg.group || "", pkg.name);

		try {
			console.log(`Processing ${pkg.name}...`);
			const responseText = changelogs[pkg.name];

			if (!responseText) {
				console.warn(`No changelog found for ${pkg.name}`);
				continue;
			}

			const releases: Release[] = responseText
				.split("## [")
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
				.filter((r): r is Release => r !== null)
				.filter(({ version }) => !version.includes("Not Published"));

			mkdirSync(workingDir, { recursive: true });

			releases.sort((a, b) => {
				return rcompare(a.version, b.version);
			});

			/*
			 * files for each version
			 */
			const len = releases.length;
			if (len === 0) {
				console.warn(`No releases found for ${pkg.name}`);
				continue;
			}

			let allContent = "";

			for (let i = 0; i < len; i++) {
				const rel = releases[i];
				if (!rel) {
					continue;
				}
				const thisVersion = rel.version;
				const notes = entitify(rel.notes);

				allContent += `\n\n## v${thisVersion}\n\n${entitify(notes)}`;

				if (i === 0) {
					// latest version
					latestVersions[pkg.name] = `v${thisVersion}`;
				}
				//
				const pageFrontmatter = [
					note,
					`title: '${pkg.name}@${thisVersion}'`,
					`description: '${thisVersion}'`,
					`order: ${i}`,
				];

				const frontmatter = ["---", ...pageFrontmatter, "---"].join("\n");
				const header = `<ReleaseHeader href="${pkg.tag}/${pkg.name}-v${thisVersion}" />`;

				const content = `${frontmatter}\n\n${header}\n${notes}`;
				const fileName = `v${thisVersion}.md`;

				writeFileSync(join(workingDir, fileName), content);
			}
			writeAllVersionsPage(pkg, allContent, workingDir);
		} catch (error) {
			console.error(`Failed to process ${pkg.name}:`, error);
		}
	}
	return latestVersions;
}

export function writeAllVersionsPage(
	pkg: Package,
	body: string,
	workingDir: string,
) {
	const frontmatter = [
		note,
		`title: '${pkg.name} - All Releases'`,
		`description: 'All changelog entries for ${pkg.name}'`,
		"order: 0",
	];
	const header = `<ReleaseHeader href="${pkg.url}" />`;

	const content = `${["---", ...frontmatter, "---"].join("\n")}\n\n${header}\n${body}`;
	writeFileSync(join(workingDir, "all_versions.md"), content);
}
