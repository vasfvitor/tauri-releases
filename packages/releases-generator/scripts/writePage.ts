import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { note } from "../config.js";

/**
 * write an individual page for each version
 */
export function writeVersionPage(params: {
  packageName: string;
  version: string;
  notes: string;
  releaseDateLabel?: string;
  githubReleaseUrl?: string;
  workingDir: string;
  order: number;
}): void {
  const {
    packageName,
    version,
    notes,
    releaseDateLabel,
    githubReleaseUrl,
    workingDir,
    order,
  } = params;
  const pageFrontmatter = [
    note,
    `title: '${packageName}@${version}'`,
    `sidebar: '${version}'`,
    `description: '${version}'`,
    `order: ${order}`,
  ];

  const frontmatter = ["---", ...pageFrontmatter, "---"].join("\n");
  const header = renderReleaseHeader(githubReleaseUrl);

  const date = renderReleaseDateLabel(releaseDateLabel);
  const heading = `# {{ $frontmatter.title }}`;
  const content = [frontmatter, header, heading, date, notes]
    .filter(Boolean)
    .join("\n\n");
  const fileName = `v${version}.md`;

  writeFileSync(join(workingDir, fileName), content);
}

function renderReleaseHeader(href: string | undefined): string {
  return href ? `<ReleaseHeader href="${href}" />` : "<ReleaseHeader />";
}

export function renderReleaseDateLabel(date: string | undefined): string {
  if (!date) {
    return "";
  }

  return `<div class="release-date-row"><small class="release-date">${date}</small></div>`;
}

export function getAllVersionsHead(
  packageName: string,
  githubUrl: string | undefined,
): string {
  const frontmatter = [
    note,
    `title: '${packageName} - full changelog'`,
    `sidebar: 'Full Changelog'`,
    `description: 'All changelog entries for ${packageName}'`,
    "order: 0",
  ];

  const header = renderReleaseHeader(githubUrl);
  const heading = "# {{ $frontmatter.title }}";
  const content = [header, heading].join("\n\n");

  return `${["---", ...frontmatter, "---"].join("\n")}${content}\n\n`;
}
