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
  githubReleaseUrl: string;
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
  const header = `<ReleaseHeader href="${githubReleaseUrl}" />`;

  const date = renderReleaseDateLabel(releaseDateLabel);
  const tags = [`# {{ $frontmatter.title }}${date}`].join("\n\n");

  const content = `${frontmatter}\n\n${header}\n\n${tags}\n\n${notes}`;
  const fileName = `v${version}.md`;

  writeFileSync(join(workingDir, fileName), content);
}

export function renderReleaseDateLabel(date: string | undefined): string {
  if (!date) {
    return "";
  }

  return ` <small class="release-date">${date}</small>`;
}

export function getAllVersionsHead(
  packageName: string,
  githubUrl: string,
): string {
  const frontmatter = [
    note,
    `title: '${packageName} - full changelog'`,
    `sidebar: 'Full Changelog'`,
    `description: 'All changelog entries for ${packageName}'`,
    "order: 0",
  ];

  const header = `<ReleaseHeader href="${githubUrl}" />`;
  const tags = ["# {{ $frontmatter.title }}"].join("\n\n");

  return `${["---", ...frontmatter, "---"].join("\n")}\n\n${header}\n\n${tags}`;
}
