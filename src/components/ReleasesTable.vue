<script setup lang="ts">
import {
    getCoreRowModel,
    useVueTable,
    createColumnHelper,
    getFilteredRowModel,
    type ColumnFiltersState,
} from '@tanstack/vue-table';
import { ref, watch, computed } from 'vue';

import sourceData from '../../packages/releases-generator/generated/tableData.json';
import type { TableData } from '../../packages/releases-generator/types';

function formatDate(val) {
    if (!val || val === "-") return '-';
    try {
        const date = new Date(val);
        return date.toISOString().split("T")[0];
    } catch (error) {
        return ''
    }
}

const { repoList, packages } = sourceData.tableMetadata

const data = ref<TableData[]>(sourceData.tableData);
const columnFilters = ref<ColumnFiltersState>([]);
const globalFilter = ref('');


const columnHelper = createColumnHelper<TableData>();
const columns = [
    columnHelper.accessor('name', {
        header: 'Package',
        filterFn: 'arrIncludes',
    }),
    columnHelper.accessor('version', { header: 'Version' }),
    columnHelper.accessor('date', {
        header: 'Release Date',
        cell: info => formatDate(info.getValue()),
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
        get globalFilter() {
            return globalFilter.value;
        },
    },


    onColumnFiltersChange: updaterOrValue => {
        columnFilters.value = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters.value) : updaterOrValue;
    },
    onGlobalFilterChange: value => {
        globalFilter.value = value;
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

watch(selectedRepo, () => {
    selectedProjects.value = [...filteredPackages.value];
}, { immediate: true });

watch(selectedProjects, (newProjects) => {
    table.getColumn('packageName')?.setFilterValue(newProjects.length > 0 ? newProjects : undefined);
});



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
