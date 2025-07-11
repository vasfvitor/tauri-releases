import {
	getCoreRowModel,
	useVueTable,
	createColumnHelper,
	getFilteredRowModel,
	type ColumnFiltersState,
	type ColumnDef,
	FlexRender,
} from "@tanstack/vue-table";
import { format, isBefore, parseISO } from "date-fns";
import { h } from "vue";
import type { TableData } from "../../../packages/releases-generator/types";

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

function formatDate(val) {
	if (!val || val === "-") return "-";
	const date = parseISO(val);
	return format(date, "MMMM d, yyyy");
}

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
			cell: (info) => formatDate(info.getValue()),
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
						// todo: render markdown

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

				// link to github?
				return h(
					"a",
					{
						href: `/${path}/v${version}`,
					},
					"Link",
				);
			},
		}),
	];
	return columns;
}
