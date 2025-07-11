<script setup lang="ts">
import {
    getCoreRowModel,
    useVueTable,
    getFilteredRowModel,
    type ColumnFiltersState,
    FlexRender,
} from '@tanstack/vue-table';
import { ref, watch, computed } from 'vue';

import sourceData from '../../../packages/releases-generator/generated/tableData.json';
import type { TableData } from '../../../packages/releases-generator/types';
import { subMonths } from 'date-fns';
import { createColumns } from './columns';
import ChangelogDialog from './ChangelogDialog.vue';

const { repoList, packages } = sourceData.tableMetadata

const data = ref<TableData[]>(sourceData.tableData);


// filters
const lastMonth = subMonths(new Date(), 1);
const filterDate = ref<string | null>(lastMonth.toISOString().split('T')[0]);
const columnFilters = ref<ColumnFiltersState>([]);
const selectedRepo = ref<string>(repoList[0]);
const selectedProjects = ref<string[]>([]);

const filteredPackages = computed(() => {
    return packages[selectedRepo.value] || [];
});



// changelog dialog
const dialogChangelogContent = ref<string | null>(null);
const isChangelogVisible = ref(false);
const showChangelogPopup = (content: string) => {
    dialogChangelogContent.value = content;
    isChangelogVisible.value = true;
};


// table
const table = useVueTable({
    get data() {
        return data.value;
    },
    columns: createColumns(showChangelogPopup),
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


// filters
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
watch(filterDate, (since) => {
    table.getColumn('date')?.setFilterValue(since);
}, { immediate: true });




// changelog dialog
watch(isChangelogVisible, (visible) => {
    if (!visible) {
        dialogChangelogContent.value = null;
    }
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
    <v-row>
        <v-col>
            <v-text-field type="date" v-model="filterDate" label="Since" />
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

    <ChangelogDialog v-model="isChangelogVisible" :content="dialogChangelogContent" />

</template>
