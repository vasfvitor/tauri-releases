import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { baseDir } from "./config.js";
import { parseAndSortChangelog } from "./scripts/parse.js";
import {
  getAllVersionsHead,
  renderReleaseDateLabel,
  writeVersionPage,
} from "./scripts/writePage.js";
import type { PackageData, Release, TableMetadata } from "./types.js";
import { parseMarkdown } from "./utils.js";
import { writeLatestVersions } from "./writeLatestVersions.js";

type ReleaseWithDate = Release & {
  date: string | "-";
  dateLabel?: string;
};

const releaseDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export async function generatePagesAndTableData(
  packageData: PackageData,
  outputDir: string = baseDir,
) {
  console.log("generating table...");
  await writeTableData(packageData, outputDir);
  console.log("generating pages...");
  writePageData(packageData, outputDir);
  writeLatestVersions(packageData);
}

export function writePageData(
  packageData: PackageData,
  outputDir: string = baseDir,
): void {
  Object.entries(packageData).forEach(([packageName, data]) => {
    const fullName = `${data.group || ""}/${packageName}`;

    const workingDir = join(outputDir, fullName);
    mkdirSync(workingDir, { recursive: true });

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

    const allVersionsStream = createWriteStream(
      join(workingDir, "all_versions.md"),
    );

    // todo: fix tag url -
    const url = data.npmData?.name || data.cratesData?.name;
    allVersionsStream.write(getAllVersionsHead(packageName, url));

    releases.forEach((release, i) => {
      const { version, notes, dateLabel } = release;
      const rawMd = parseMarkdown(notes, "markdown");

      allVersionsStream.write(
        `\n\n## v${version}${renderReleaseDateLabel(dateLabel)}\n\n${rawMd}`,
      );

      writeVersionPage({
        packageName,
        version,
        notes: rawMd,
        ...(dateLabel ? { releaseDateLabel: dateLabel } : {}),
        // todo: fix tag url - should point either to the current release or the full changelog if the all version page
        tag: packageName,
        workingDir,
        order: releases.length - i,
      });
    });

    allVersionsStream.end();
  });
}

export async function writeTableData(
  packageData: PackageData,
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
    repoList.add(data.group || packageName);
  });
  tableMetadata.repoList = Array.from(repoList);

  stream.write(JSON.stringify(tableMetadata, null, 2));
  // open
  stream.write(',\n"tableData": [');

  let isFirst = true;

  for (const [packageName, data] of Object.entries(packageData)) {
    const repo = data.group || packageName;

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
        date,
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

    if (date === "-") {
      return { ...release, date };
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
): string | "-" {
  const npmDate = data.npmData?.versions?.[version];
  if (npmDate) {
    return npmDate;
  }

  const cratesDate = data.cratesData?.versions?.[version];
  if (cratesDate) {
    return cratesDate;
  }

  return "-";
}
