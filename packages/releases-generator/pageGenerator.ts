import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir, repositories } from "./config.js";
import { parseAndSortChangelog } from "./scripts/parse.js";
import {
  getAllVersionsHead,
  renderReleaseDateLabel,
  writeVersionPage,
} from "./scripts/writePage.js";
import type {
  PackageData,
  Release,
  RepoPackage,
  Repository,
  TableMetadata,
} from "./types.js";
import { parseMarkdown } from "./utils.js";
import { writeLatestVersions } from "./writeLatestVersions.js";

export type ReleaseWithDate = Release & {
  date?: string;
  dateLabel?: string;
};

export type ReleasesByPackage = Map<string, ReleaseWithDate[]>;

interface PackageConfig {
  repo: Repository;
  pkg: RepoPackage;
  changelogUrl: string;
}

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function getGitHubReleaseTagBase(repo: Repository, pkg: RepoPackage): string {
  if (repo.name === "plugins-workspace") {
    return pkg.name;
  }

  return pkg.cratesPath || pkg.npmPath || pkg.name;
}

function buildGitHubReleaseUrl(
  repo: Repository,
  pkg: RepoPackage,
  version: string,
): string {
  const tagBase = encodeURIComponent(getGitHubReleaseTagBase(repo, pkg));
  return `${repo.repoUrl}/releases/tag/${tagBase}-v${version}`;
}

const packageConfigs = new Map<string, PackageConfig>();
for (const repo of repositories) {
  const branch = repo.branch || "dev";
  for (const pkg of repo.packages) {
    const path =
      pkg.githubPath === "__root__"
        ? "CHANGELOG.md"
        : `${pkg.githubPath}/CHANGELOG.md`;
    packageConfigs.set(pkg.name, {
      repo,
      pkg,
      changelogUrl: `${repo.repoUrl}/blob/${branch}/${path}`,
    });
  }
}

export async function generatePagesAndTableData(
  packageData: PackageData,
  outputDir: string = baseDir,
) {
  const releasesByPackage = buildReleasesByPackage(packageData);
  await writeTableData(packageData, releasesByPackage, outputDir);
  writePageData(packageData, releasesByPackage, outputDir);
  writeLatestVersions(packageData, releasesByPackage);
}

export function buildReleasesByPackage(
  packageData: PackageData,
): ReleasesByPackage {
  const releasesByPackage: ReleasesByPackage = new Map();
  for (const [packageName, data] of Object.entries(packageData)) {
    if (!data.changelogs) {
      console.warn(`missing changelog ${packageName}`);
    }
    const releases = withReleaseDates(
      parseAndSortChangelog(data.changelogs),
      data,
    );
    if (releases.length === 0) {
      console.warn(`missing releases ${packageName}`);
    }
    releasesByPackage.set(packageName, releases);
  }
  return releasesByPackage;
}

export function writePageData(
  packageData: PackageData,
  releasesByPackage: ReleasesByPackage,
  outputDir: string = baseDir,
): void {
  Object.entries(packageData).forEach(([packageName, data]) => {
    const fullName = `${data.group || ""}/${packageName}`;

    const workingDir = join(outputDir, fullName);
    mkdirSync(workingDir, { recursive: true });

    const releases = releasesByPackage.get(packageName) ?? [];
    const config = packageConfigs.get(packageName);
    const changelogUrl = config?.changelogUrl;

    const allVersionsStream = createWriteStream(
      join(workingDir, "all_versions.md"),
    );

    allVersionsStream.write(getAllVersionsHead(packageName, changelogUrl));

    releases.forEach((release, i) => {
      const { version, notes, dateLabel } = release;
      const rawMd = parseMarkdown(notes, "markdown");

      const heading = `\n\n## v${version}\n\n`;
      const releaseDateLabel = renderReleaseDateLabel(dateLabel);
      const content = [heading, releaseDateLabel, rawMd]
        .filter(Boolean)
        .join("\n\n");
      allVersionsStream.write(content);

      const releaseUrl = config
        ? buildGitHubReleaseUrl(config.repo, config.pkg, version)
        : changelogUrl;

      writeVersionPage({
        packageName,
        version,
        notes: rawMd,
        ...(dateLabel ? { releaseDateLabel: dateLabel } : {}),
        ...(releaseUrl ? { githubReleaseUrl: releaseUrl } : {}),
        workingDir,
        order: releases.length - i,
      });
    });

    allVersionsStream.end();
  });
}

export async function writeTableData(
  packageData: PackageData,
  releasesByPackage: ReleasesByPackage,
  outputDir: string = baseDir,
): Promise<void> {
  const tableMetadata: TableMetadata = {
    packages: {},
    repoList: [],
  };
  const repoList = new Set<string>();

  const publicDir = join(outputDir, "public");
  mkdirSync(publicDir, { recursive: true });
  const tableDataPath = join(publicDir, "tableData.json");

  const stream = createWriteStream(tableDataPath);

  stream.write('{\n"tableMetadata": ');

  Object.entries(packageData).forEach(([packageName, data]) => {
    const key = data.group || packageName;
    if (!tableMetadata.packages[key]) {
      tableMetadata.packages[key] = [];
    }
    (tableMetadata.packages[key] as string[]).push(packageName);
    repoList.add(key);
  });
  tableMetadata.repoList = Array.from(repoList);

  stream.write(JSON.stringify(tableMetadata, null, 2));
  // open
  stream.write(',\n"tableData": [');

  let isFirst = true;

  for (const [packageName, data] of Object.entries(packageData)) {
    const repo = data.group || packageName;
    const releases = releasesByPackage.get(packageName) ?? [];

    for (const release of releases) {
      if (!isFirst) {
        stream.write(",");
      }

      const { version, notes, date } = release;
      const parsedMd = parseMarkdown(notes, "html");

      const row = {
        name: packageName,
        repo,
        version,
        changelog: parsedMd,
        ...(date ? { date } : {}),
      };
      stream.write(JSON.stringify(row));
      isFirst = false;
    }
  }
  // close
  stream.write("]\n}");
  stream.end();
}

export function withReleaseDates(
  releases: Release[],
  data: PackageData[string],
): ReleaseWithDate[] {
  return releases.map((release) => {
    const date = getReleaseDate(release.version, data);

    if (!date) {
      return { ...release };
    }

    return {
      ...release,
      date,
      dateLabel: releaseDateFormatter.format(new Date(date)),
    };
  });
}

function getReleaseDate(
  version: string,
  data: PackageData[string],
): string | undefined {
  const npmDate = data.npmData?.versions?.[version];
  if (npmDate) {
    return npmDate;
  }

  const cratesDate = data.cratesData?.versions?.[version];
  if (cratesDate) {
    return cratesDate;
  }
  return undefined;
}
