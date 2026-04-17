import type { TableData } from "../../../packages/releases-generator/types";

export interface ReleaseMajorGroup {
  label: string;
  rows: TableData[];
}

export function sortReleasesByDateDesc(rows: TableData[]): TableData[] {
  return [...rows].sort((a, b) => getDateTime(b.date) - getDateTime(a.date));
}

export function getReleaseMajor(version: string): string {
  const match = /^(\d+)\./.exec(version);
  if (!match?.[1]) {
    return "Other";
  }

  return `v${match[1]}`;
}

export function buildMajorGroups(rows: TableData[]): ReleaseMajorGroup[] {
  const groups: ReleaseMajorGroup[] = [];
  const groupByLabel = new Map<string, ReleaseMajorGroup>();

  for (const row of rows) {
    const label = getReleaseMajor(row.version);
    let group = groupByLabel.get(label);

    if (!group) {
      group = { label, rows: [] };
      groupByLabel.set(label, group);
      groups.push(group);
    }

    group.rows.push(row);
  }

  return groups;
}

function getDateTime(value: string | undefined): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}
