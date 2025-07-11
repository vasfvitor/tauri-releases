<script setup lang="ts">
import {
    getCoreRowModel,
    useVueTable,
    createColumnHelper,
    getFilteredRowModel,
    type ColumnFiltersState,
    type ColumnDef,
    FlexRender,
} from '@tanstack/vue-table';
import { ref, watch, computed } from 'vue';

import sourceData from '../../packages/releases-generator/generated/tableData.json';
import type { TableData } from '../../packages/releases-generator/types';

function formatDate(val) {
    if (!val || val === "-") return '-';
    const date = new Date(val);
    return date.toISOString().split("T")[0];
}

const dateInRange = (row, columnId, filterValue) => {
    const value = new Date(row.getValue(columnId));
    const from = filterValue?.from ? new Date(filterValue.from) : null;
    const to = filterValue?.to ? new Date(filterValue.to) : null;

    if (from && value < from) return false;
    if (to && value > to) return false;
    return true;
};

const strictIncludes = (row, columnId, filterValues: string[]) => {
    const cellValue = row.getValue(columnId);
    return filterValues.includes(cellValue);
};


const { repoList, packages } = sourceData.tableMetadata

const data = ref<TableData[]>(sourceData.tableData);
const dateRange = ref<{ from: string | null, to: string | null }>({ from: null, to: null });

const columnFilters = ref<ColumnFiltersState>([]);


const columnHelper = createColumnHelper<TableData>();
const columns: ColumnDef<TableData, string>[] = [
    columnHelper.accessor('repo', {
        header: 'Repository',
        filterFn: 'equals',
    }),

    columnHelper.accessor('name', {
        header: 'Package',
        filterFn: strictIncludes,
    }),

    columnHelper.accessor('version', { header: 'Version' }),

    columnHelper.accessor('date', {
        header: 'Release Date',
        cell: info => formatDate(info.getValue()),
        enableColumnFilter: true,
        filterFn: dateInRange,
    }),
];

const table = useVueTable({
    get data() {
        return data.value;
    },
    columns,
    state: {
        get columnFilters() {
            return columnFilters.value;
        },

    },
    onColumnFiltersChange: (t) => {
        columnFilters.value = typeof t === 'function'
            ? t(columnFilters.value)
            : t
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
});

// const rerender = () => {
//     data.value = defaultData
// }

const selectedRepo = ref<string>(repoList[0]);
const selectedProjects = ref<string[]>([]);

const filteredPackages = computed(() => {
    return packages[selectedRepo.value] || [];
});

watch(selectedRepo, (newRepo) => {
    table.getColumn('repo')?.setFilterValue(newRepo);
    selectedProjects.value = [...filteredPackages.value];
}, { immediate: true });


watch(selectedProjects, (newProjects) => {
    const col = table.getColumn('name');
    if (col) {
        col.setFilterValue(newProjects.length ? newProjects : undefined);
    }
});
watch(dateRange, (range) => {

    table.getColumn('date')?.setFilterValue(range);
}, { immediate: true });



</script>


<template>
    <v-row>
        <v-col cols="12" sm="6">
            <v-select v-model="selectedRepo" :items="repoList" label="Repository" />
        </v-col>
        <v-col cols="12" sm="6">
            <v-select v-model="selectedProjects" :items="filteredPackages" label="Projects" multiple>
                <template #selection="{ item, index }">
                    <template v-if="index < 2">{{ item.title }}</template>
                    <span v-if="index === 2">(+{{ selectedProjects.length - 2 }})</span>
                </template>
            </v-select>
        </v-col>
    </v-row>
    <v-row>
        <v-col>
            <v-text-field type="date" v-model="dateRange.from" label="From" />
        </v-col>
        <v-col>
            <v-text-field type="date" v-model="dateRange.to" label="To" />
        </v-col>
    </v-row>


    <v-table class="mt-4">
        <thead>
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <th v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan">
                    <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                        :props="header.getContext()" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in table.getRowModel().rows" :key="row.id">
                <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </td>
            </tr>
        </tbody>
    </v-table>
</template>
