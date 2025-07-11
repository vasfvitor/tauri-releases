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
import { ref, watch, computed, h } from 'vue';

import sourceData from '../../packages/releases-generator/generated/tableData.json';
import type { TableData } from '../../packages/releases-generator/types';
import { parseISO, format, isBefore, subMonths } from 'date-fns';

function formatDate(val) {
    if (!val || val === "-") return '-';
    const date = parseISO(val);
    return format(date, "MMMM d, yyyy");

}

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


const strictIncludes = (row, columnId, filterValues: string[]) => {
    const cellValue = row.getValue(columnId);
    return filterValues.includes(cellValue);
};


const { repoList, packages } = sourceData.tableMetadata

const data = ref<TableData[]>(sourceData.tableData);

const lastMonth = subMonths(new Date(), 1);
const filterDate = ref<string | null>(lastMonth.toISOString().split('T')[0]);

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

    columnHelper.accessor('changelog', {
        header: 'Changelog',
        cell: info => {
            const changelogContent = info.getValue();
            return h('a', {
                href: '#',
                // todo: render markdown

                onClick: (event) => {
                    event.preventDefault();
                    showChangelogPopup(changelogContent);
                },
            }, 'see more');
        },

    }),
    columnHelper.display({
        id: 'link',
        header: 'Link',
        cell: info => {
            const { repo, name, version } = info.row.original;
            const isRoot = repo === name && repo !== 'tauri'
            const path = isRoot ? repo : `${repo}/${name}`;

            // link to github?
            return h('a', {
                href: `/${path}/v${version}`
            }, 'Link');
        },
    })


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
watch(filterDate, (since) => {
    table.getColumn('date')?.setFilterValue(since);
}, { immediate: true });


const dialogChangelogContent = ref<string | null>(null);
const dialogVisible = ref(false);
const showChangelogPopup = (content: string) => {
    dialogChangelogContent.value = content;
    dialogVisible.value = true;
};

const closeChangelog = () => {
    dialogVisible.value = true;
};

const afterLeave = () => {
    dialogChangelogContent.value = null;
    dialogVisible.value = false;
}

const isChangelogVisible = ref(false);

watch(dialogChangelogContent, (v) => {
    isChangelogVisible.value = v !== null;
});

watch(isChangelogVisible, (visible) => {
    if (!visible) closeChangelog();
});

watch(isChangelogVisible, (visible) => {
    if (!visible) closeChangelog();
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

    <v-dialog @after-leave="afterLeave" v-model="isChangelogVisible" max-width="600px">
        <v-card>
            <v-card-title>Changelog </v-card-title>
            <v-card-actions>
                <v-btn color="primary" text @click="closeChangelog">Close</v-btn>
            </v-card-actions>
            <v-card-text>
                <div class="vp-doc" v-html="dialogChangelogContent"></div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
