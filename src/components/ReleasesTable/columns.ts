import { type ColumnDef, createColumnHelper } from "@tanstack/vue-table";
import { isBefore, parseISO } from "date-fns";
import { useData } from "vitepress";
import { h } from "vue";
import type { TableData } from "../../../packages/releases-generator/types";
import { formatReleaseDate } from "../releaseData";

const strictIncludes = (row, columnId, filterValues: string[]) => {
  const cellValue = row.getValue(columnId);
  return filterValues.includes(cellValue);
};

const dateInRange = (row, columnId, filterValue) => {
  if (!filterValue) {
    return true;
  }
  const cellValue = row.getValue(columnId);
  if (!cellValue || cellValue === "-") {
    return false;
  }
  const value = parseISO(cellValue);
  const since = parseISO(filterValue);

  if (isBefore(value, since)) {
    return false;
  }

  return true;
};

export function createColumns(showChangelogPopup) {
  const columnHelper = createColumnHelper<TableData>();
  const columns: ColumnDef<TableData, string>[] = [
    columnHelper.accessor("repo", {
      header: "Repository",
      filterFn: "equals",
    }),

    columnHelper.accessor("name", {
      header: "Package",
      filterFn: strictIncludes,
    }),

    columnHelper.accessor("version", { header: "Version" }),

    columnHelper.accessor("date", {
      header: "Release Date",
      cell: (info) => formatReleaseDate(info.getValue()),
      enableColumnFilter: true,
      filterFn: dateInRange,
    }),

    columnHelper.accessor("changelog", {
      header: "Changelog",
      cell: (info) => {
        const changelogContent = info.getValue();
        return h(
          "a",
          {
            href: "#",
            onClick: (event) => {
              event.preventDefault();
              showChangelogPopup(changelogContent);
            },
          },
          "see more",
        );
      },
    }),
    columnHelper.display({
      id: "link",
      header: "Link",
      cell: (info) => {
        const { repo, name, version } = info.row.original;
        const isRoot = repo === name && repo !== "tauri";
        const path = isRoot ? repo : `${repo}/${name}`;

        const { site } = useData();

        let to = `/${path}/v${version}`;
        if (site.value.base) {
          to = `${site.value.base}${to}`;
        }
        // link to github?
        return h(
          "a",
          {
            href: to,
          },
          "Link",
        );
      },
    }),
  ];
  return columns;
}
