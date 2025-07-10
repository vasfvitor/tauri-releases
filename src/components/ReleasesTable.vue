<script lang="ts">
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    createColumnHelper,
    getFilteredRowModel,
    type ColumnFiltersState,
} from '@tanstack/vue-table';
import { h, ref, watch, computed } from 'vue';

import { tableData, tableMetadata } from '../../packages/releases-generator/generated/tableData.json';
import type { TablePackageData, RepoData } from '../../packages/releases-generator/types';

function formatDate(val) {
    if (!val) return '';
    const date = new Date(val);
    return date.toISOString().split("T")[0];
}

const data = ref<TablePackageData[]>(tableData);
const filters = ref<ColumnFiltersState>([]);
const repoData: RepoData = {
    packageList: tableMetadata.packageList,
    repoList: tableMetadata.repoList,
};

const columnHelper = createColumnHelper<TablePackageData>();

function getLatestVersion(data: TablePackageData): [string, string] {
    const npmVersions = data.npmData?.versions || {};
    const cratesVersions = data.cratesData?.versions || {};

    const allVersions = [
        ...Object.entries(npmVersions),
        ...Object.entries(cratesVersions)
    ].filter(([, date]) => date != null) as [string, string][];

    if (allVersions.length === 0) return ['', ''];

    return allVersions.sort(([, dateA], [, dateB]) =>
        new Date(dateB).getTime() - new Date(dateA).getTime()
    )[0];
}

const columns = [
    columnHelper.accessor(row => (row.group ? `${row.group}/${row.name}` : row.name), {
        id: 'repoPkg',
        header: 'Repository/Package',
        cell: info => info.getValue(),
        filterFn: 'includesString',
    }),
    columnHelper.accessor(row => getLatestVersion(row)[0], {
        id: 'version',
        header: 'Latest Version',
        cell: info => {
            const version = info.getValue();
            return version ? h('span', { class: 'version-number' }, version) : '';
        },
    }),
    columnHelper.accessor(row => getLatestVersion(row)[1], {
        id: 'date',
        header: 'Release Date',
        cell: info => {
            const date = info.getValue();
            return date ? h('span', { class: 'version-date' }, formatDate(date)) : '';
        },
    }),
];

const table = useVueTable({
    get data() {
        return data.value;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
        get columnFilters() {
            return filters.value;
        },
    },
    onColumnFiltersChange: updater => {
        if (typeof updater === 'function') {
            filters.value = updater(filters.value);
        } else {
            filters.value = updater;
        }
    },
});

export default {
    name: 'ReleasesTable',
    setup() {
        const selectedRepo = ref<string>(repoData.repoList[0]);
        const selectedProject = ref<string>(repoData.packageList[selectedRepo.value]?.[0] || '');

        const filteredPackages = computed(() => {
            return repoData.packageList[selectedRepo.value] || [];
        });

        watch(selectedRepo, () => {
            selectedProject.value = repoData.packageList[selectedRepo.value]?.[0] || '';
        });

        watch(selectedProject, (newProject) => {
            const newFilter = newProject ? [{ id: 'repoPkg', value: newProject }] : [];
            filters.value = newFilter;
        });

        return {
            table,
            selectedRepo,
            selectedProject,
            repoList: repoData.repoList,
            filteredPackages,
            FlexRender
        };
    },
};
</script>

<template>
    <div class="releases-table">
        <div class="filters">
            <div class="filter-group">
                <label class="filter-label">
                    Repository:
                    <select v-model="selectedRepo" class="filter-select">
                        <option v-for="repo in repoList" :key="repo" :value="repo">
                            {{ repo }}
                        </option>
                    </select>
                </label>
                <label class="filter-label">
                    Project:
                    <select v-model="selectedProject" class="filter-select">
                        <option v-for="project in filteredPackages" :key="project" :value="project">
                            {{ project }}
                        </option>
                    </select>
                </label>
            </div>
        </div>

        <div class="table-container">
            <table class="table">
                <thead>
                    <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <th v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan"
                            class="table-header">
                            <div v-if="!header.isPlaceholder">
                                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in table.getRowModel().rows" :key="row.id" class="table-row">
                        <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="table-cell">
                            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
