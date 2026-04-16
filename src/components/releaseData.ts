import { format, parseISO } from "date-fns";
import { withBase } from "vitepress";
import type {
  TableData,
  TableMetadata,
} from "../../packages/releases-generator/types";

export interface ReleaseDataPayload {
  tableMetadata: TableMetadata;
  tableData: TableData[];
}

let releaseDataPromise: Promise<ReleaseDataPayload> | null = null;

export function loadReleaseData() {
  if (!releaseDataPromise) {
    releaseDataPromise = fetch(withBase("/tableData.json"))
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load release data: ${response.statusText}`,
          );
        }

        return response.json() as Promise<ReleaseDataPayload>;
      })
      .catch((error) => {
        releaseDataPromise = null;
        throw error;
      });
  }

  return releaseDataPromise;
}

export function formatReleaseDate(value: string | undefined | null) {
  if (!value || value === "-") return "-";
  return format(parseISO(value), "MMM d, yyyy");
}
