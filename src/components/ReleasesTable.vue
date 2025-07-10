<script lang="ts">
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    createColumnHelper,
    type ColumnFiltersState,
} from '@tanstack/vue-table';
import { h, ref, watch } from 'vue';

import { tableData, tableMetadata } from '../../packages/releases-generator/generated/tableData.json';


import type { TablePackageData, RepoData } from '../../packages/releases-generator/types';

function formatDate(val) {
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
        footer: props => props.column.id,
        columns: [
            columnHelper.accessor(row => (row.group ? `${row.group}/${row.name}` : row.name)
                , {
                    id: 'repoPkg',
                    cell: info => info.getValue(),
                    header: () => 'Repository/Package',
                    filterFn: 'includesString',
                }),
        ],
    }),
    columnHelper.group({
        header: 'Version Info',
        footer: props => props.column.id,
        columns: [
            columnHelper.accessor('npmData.versions', {
                header: () => 'Latest NPM Versions',
                cell: info => {
                    const versions: Record<string, string> = info.getValue();
                    if (!versions) { return '' };
                    return h(
                        'ul',
                        { class: 'version-list' },
                        Object.entries(versions).map(([version, date]) =>
                            h('li', `${version} (${formatDate(date)})`)
                        )
                    );
                },
            }),
            columnHelper.accessor('cratesData.versions', {
                header: () => 'Latest Crates Versions',
                cell: info => {
                    const versions: Record<string, string> = info.getValue();
                    if (!versions) { return '' };
                    return h(
                        'ul',
                        { class: 'version-list' },
                        Object.entries(versions).map(([version, date]) =>
                            h('li', `${version} (${formatDate(date)})`)
                        )
                    );
                },
            }),
        ],
    }),
];

const ttable = useVueTable({
    get data() {
        return data.value;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
        columnFilters: filters.value,
    },
});


export default {
    name: 'ReleasesTable',
    setup() {
        const table = ttable;
        const selectedKey = ref<'name' | keyof TablePackageData>('name');
        const selectedRepo = ref<string>(repoData.repoList[0]);
        const selectedProject = ref<string>(repoData.packageList[selectedRepo.value]?.[0] || '');

        watch(selectedRepo, () => {
            selectedProject.value = repoData.packageList[selectedRepo.value]?.[0] || '';
        });

        watch(selectedProject, (newProject) => {
            setFilter('name', newProject);
        });



        const setFilter = (columnId: string, value: string) => {
            const existingFilterIndex = filters.value.findIndex(filter => filter.id === columnId);
            if (existingFilterIndex !== -1) {
                if (value) {
                    filters.value[existingFilterIndex].value = value;
                } else {
                    filters.value.splice(existingFilterIndex, 1);
                }
            } else if (value) {
                filters.value.push({ id: columnId, value });
            }
            table.setColumnFilters(filters.value);
        };

        const repoList = repoData.repoList;
        const packageList = repoData.packageList;

        return { table, filters, setFilter, selectedKey, selectedRepo, selectedProject, repoList, packageList };
    },
};
</script>


<template>
    <div class="p-2">
        <div class="filters">

            <label>
                Repository:
                <select v-model="selectedRepo">
                    <option v-for="repo in repoList" :key="repo" :value="repo">
                        {{ repo }}
                    </option>
                </select>
            </label>
            <label>
                Project:
                <select v-model="selectedProject">
                    <option v-for="project in packageList[selectedRepo]" :key="project" :value="project">
                        {{ project }}
                    </option>
                </select>
            </label>
        </div>
        <table class="table">
            <thead>
                <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                    <th v-for="header in headerGroup.headers" :key="header.id" :colSpan="header.colSpan">
                        <div v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
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
        </table>
    </div>
</template>

<style scoped>
li {
    list-style: none !important;
}
</style>