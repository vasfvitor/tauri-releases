import type { Package, Repository } from "./types";

import { writeIndexPage } from "./table";
import { generateVersionPages } from "./page";
import { repositories } from "./config";

function getAllPackages(repositoriesList: Repository[]): {
	packages: Package[];
	markdownOutput: string;
} {
	let markdownOutput = "";
	const allPackages = [];

	for (const repo of repositoriesList) {
		const [owner, repoName] = repo.repoUrl
			.replace("https://github.com/", "")
			.split("/");

		// todo: define branch?
		const group = repo.packages.length > 1 ? repo.name : null;
		const branch = repo.branch || "dev";

		// todo use github api?
		const rawContentUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}`;

		// this could be in a separate function
		const repoSlug = repo.repoUrl
			.replace("https://github.com/", "")
			.replace(/\/$/, "");
		markdownOutput += `### ${repo.displayName} [${repoSlug}](${repo.repoUrl})\n\n`;
		markdownOutput += "| Component | Description | Version |\n";
		markdownOutput += "|-----------|-------------|---------|\n";

		for (const pkg of repo.packages) {
			const changelog = pkg.path
				? `${rawContentUrl}/${pkg.path}/CHANGELOG.md`
				: `${rawContentUrl}/CHANGELOG.md`;
			const data = {
				tag: `${repo.repoUrl}/releases/tag`,
				parentUrl: repo.repoUrl,
				description: repo.displayName,
				url: `${repo.repoUrl}/tree/${branch}/${pkg.path || ""}`,
				name: pkg.name,
				group,
				changelog,
				packages: repo.packages,
			};
			allPackages.push(data);

			// summary for table
			const componentLinks = [];
			const versionBadges = [];

			if (pkg.cargo) {
				const cargoName = pkg.cargo.split("/").pop();
				componentLinks.push(`[**${pkg.name} (crate)**](${pkg.cargo})`);
				versionBadges.push(
					`[![crates.io version](https://img.shields.io/crates/v/${cargoName}.svg)](${pkg.cargo})`,
				);
			}

			if (pkg.npm) {
				const npmUrl = new URL(pkg.npm);
				const npmName = npmUrl.pathname.replace("/package/", "");
				componentLinks.push(`[**${pkg.name} (npm)**](${pkg.npm})`);
				versionBadges.push(
					`[![npm version](https://img.shields.io/npm/v/${npmName}.svg)](${pkg.npm})`,
				);
			}

			const packageNameLink = componentLinks.join("<br>");
			const version = versionBadges.join("<br>");
			const row = `| ${packageNameLink} | ${pkg.description} | ${version} |\n`;

			markdownOutput += row;
		}
		markdownOutput += "\n";
	}

	return { packages: allPackages, markdownOutput };
}

const { packages: global_packages, markdownOutput } =
	getAllPackages(repositories);

async function main() {
	await generateVersionPages(global_packages);
	writeIndexPage(markdownOutput);
}

main();
