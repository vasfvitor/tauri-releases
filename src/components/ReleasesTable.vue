<script lang="ts">
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    createColumnHelper,
} from '@tanstack/vue-table';
import { h, ref } from 'vue';

import releasesData from '../../packages/releases-generator/generated/tableData.json';

import type { TablePackageData } from '../../packages/releases-generator/types';


const data = ref<TablePackageData[]>(releasesData);

const columnHelper = createColumnHelper<TablePackageData>();
const columns = [
    columnHelper.group({
        header: 'Package Details',
        footer: props => props.column.id,
        columns: [
            columnHelper.accessor('packageName', {
                cell: info => info.getValue(),
                header: () => 'Package Name',
            }),
            columnHelper.accessor(row => row.group, {
                id: 'group',
                cell: info => info.getValue(),
                header: () => 'Group',
            }),
        ],
    }),
    columnHelper.group({
        header: 'Version Info',
        footer: props => props.column.id,
        columns: [
            // Custom cell renderer for an array of versions
            columnHelper.accessor('npmData.versions', {
                header: () => 'Latest NPM Versions',
                cell: info => {
                    const versions: Record<string, string> = info.getValue();
                    if (!versions) { return '' };
                    return h(
                        'ul',
                        { class: 'version-list' },
                        Object.entries(versions).map(([version, date]) =>
                            h('li', `${version} (${date})`)
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
                            h('li', `${version} (${date})`)
                        )
                    );
                },
            }),
        ],
    }),
]
const rerender = () => {
    data.value = releasesData
}

const ttable = useVueTable({
    get data() {
        return data.value;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
})


export default {
    name: 'ReleasesTable',
    setup() {
        const table = ttable;
        return { table };
    },
};

</script>


<template>
    <div class="p-2">
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
/* Added 'scoped' to prevent styles from leaking */
.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    vertical-align: top;
    /* Good for lists in cells */
}

.table th {
    background-color: #f4f4f4;
}

/* Style for the version lists inside cells */
.version-list {
    margin: 0;
    padding-left: 1.2em;
    font-size: 0.9em;
}
</style>