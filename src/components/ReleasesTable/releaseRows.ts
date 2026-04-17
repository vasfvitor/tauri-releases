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

function getDateTime(value: string | undefined): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}
