import type { Repository } from "../types";

const cratesUrl = "https://crates.io/crates";
const npmUrl = "https://www.npmjs.com/package";
const shieldUrl = "https://img.shields.io";

export function getSummaryTable(repositoriesList: Repository[]): string {
	let markdownOutput = "";

	for (const repo of repositoriesList) {
		const repoSlug = repo.repoUrl
			.replace("https://github.com/", "")
			.replace(/\/$/, "");
		markdownOutput += `### ${repo.displayName} [${repoSlug}](${repo.repoUrl})\n\n`;
		markdownOutput += "| Component | Description | Version |\n";
		markdownOutput += "|-----------|-------------|---------|\n";

		for (const pkg of repo.packages) {
			const componentLinks = [];
			const versionBadges = [];
			const { name, cratesPath, npmPath } = pkg;

			if (cratesPath) {
				const crate = cratesPath.split("/").pop();

				const url = `${cratesUrl}/${crate}`;
				componentLinks.push(`[**${name} (crate)**](${url})`);

				const badgeUrl = `${shieldUrl}/crates/v/${crate}.svg)](${cratesPath}`;

				versionBadges.push(`[![crates.io version](${badgeUrl})`);
			}

			if (npmPath) {
				const npmName = npmPath.replace("/package/", "");
				const url = `${npmUrl}/${npmName}`;

				componentLinks.push(`[**${name} (npm)**](${url})`);

				const badgeUrl = `${shieldUrl}/npm/v/${npmName}.svg)](${npmPath}`;
				versionBadges.push(`[![npm version](${badgeUrl})`);
			}

			const packageNameLink = componentLinks.join("<br>");
			const version = versionBadges.join("<br>");
			const row = `| ${packageNameLink} | ${pkg.description} | ${version} |\n`;

			markdownOutput += row;
		}
		markdownOutput += "\n";
	}

	return markdownOutput;
}
