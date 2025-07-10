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
const columns = [
    columnHelper.group({
        header: 'Package Details',
        columns: [
            columnHelper.accessor(row => (row.group ? `${row.group}/${row.name}` : row.name), {
                id: 'repoPkg',
                cell: info => info.getValue(),
                header: () => 'Repository/Package',
                filterFn: 'includesString',
            }),
        ],
    }),
    columnHelper.group({
        header: 'Version Info',
        columns: [
            columnHelper.accessor('npmData.versions', {
                header: () => 'Latest NPM Versions',
                cell: info => {
                    const versions: Record<string, string> = info.getValue();
                    if (!versions) return '';
                    const sortedVersions = Object.entries(versions)
                        .sort(([, dateA], [, dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
                    return h(
                        'ul',
                        { class: 'version-list' },
                        sortedVersions.map(([version, date]) =>
                            h('li', { class: 'version-item' }, [
                                h('span', { class: 'version-number' }, version),
                                h('span', { class: 'version-date' }, formatDate(date))
                            ])
                        )
                    );
                },
            }),
            columnHelper.accessor('cratesData.versions', {
                header: () => 'Latest Crates Versions',
                cell: info => {
                    const versions: Record<string, string> = info.getValue();
                    if (!versions) return '';
                    const sortedVersions = Object.entries(versions)
                        .sort(([, dateA], [, dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
                    return h(
                        'ul',
                        { class: 'version-list' },
                        sortedVersions.map(([version, date]) =>
                            h('li', { class: 'version-item' }, [
                                h('span', { class: 'version-number' }, version),
                                h('span', { class: 'version-date' }, formatDate(date))
                            ])
                        )
                    );
                },
            }),
        ],
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

<style scoped>
/* .releases-table {
    padding: 1rem;
}

.filters {
    margin-bottom: 1.5rem;
}

.filter-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.filter-label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.filter-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    min-width: 200px;
}

.table-container {
    overflow-x: auto;
}

.table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

.table-header {
    background: #f5f5f5;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #ddd;
}

.table-cell {
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.table-row:hover {
    background: #f8f8f8;
}

.version-list {
    padding: 0;
    margin: 0;
}

.version-item {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    gap: 1rem;
}

.version-number {
    font-weight: 500;
    color: #2563eb;
}

.version-date {
    color: #666;
    font-size: 0.9em;
} */
</style>