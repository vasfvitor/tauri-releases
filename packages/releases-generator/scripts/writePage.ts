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
  const header = `<ReleaseHeader githubRelease="${tag}/${packageName}-v${version}" />`;

  const tags = ["# {{ $frontmatter.title }}"].join("\n\n");

  const content = `${frontmatter}\n\n${header}\n\n${tags}\n\n${notes}`;
  const fileName = `v${version}.md`;

  writeFileSync(join(workingDir, fileName), content);
}

export function getAllVersionsHead(packageName: string, url: string): string {
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

  return `${["---", ...frontmatter, "---"].join("\n")}\n\n${header}\n\n${tags}`;
}
