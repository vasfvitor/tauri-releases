<script setup lang="ts">
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { subMonths } from "date-fns";
import { withBase } from "vitepress";
import { computed, onMounted, ref, watch } from "vue";
import type {
  TableData,
  TableMetadata,
} from "../../../packages/releases-generator/types";
// biome-ignore lint/correctness/noUnusedImports: Used by the Vue template.
import ChangelogDialog from "./ChangelogDialog.vue";
import { createColumns } from "./columns";

interface TableDataPayload {
  tableMetadata: TableMetadata;
  tableData: TableData[];
}

const repoList = ref<string[]>([]);
const packages = ref<Record<string, string[]>>({});
const data = ref<TableData[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

// filters
const lastMonth = subMonths(new Date(), 1);
const filterDate = ref<string | null>(lastMonth.toISOString().split("T")[0]);
const columnFilters = ref<ColumnFiltersState>([]);
const selectedRepo = ref<string>("");
const selectedProjects = ref<string[]>([]);

const filteredPackages = computed(() => {
  return packages.value[selectedRepo.value] || [];
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
    columnFilters.value = typeof t === "function" ? t(columnFilters.value) : t;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});

// filters
watch(selectedRepo, (newRepo) => {
  if (!newRepo) {
    return;
  }
  table.getColumn("repo")?.setFilterValue(newRepo);
  selectedProjects.value = [...filteredPackages.value];
});

watch(selectedProjects, (newProjects) => {
  const col = table.getColumn("name");
  if (col) {
    col.setFilterValue(newProjects.length ? newProjects : undefined);
  }
});
watch(
  filterDate,
  (since) => {
    table.getColumn("date")?.setFilterValue(since);
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    const response = await fetch(withBase("/tableData.json"));
    if (!response.ok) {
      throw new Error(`Failed to load release data: ${response.statusText}`);
    }
    const payload = (await response.json()) as TableDataPayload;
    repoList.value = payload.tableMetadata.repoList;
    packages.value = payload.tableMetadata.packages;
    data.value = payload.tableData;
    selectedRepo.value = repoList.value[0] ?? "";
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : "Failed to load release data.";
  } finally {
    isLoading.value = false;
  }
});
</script>


<template>
    <div class="vp-raw">
        <p v-if="isLoading">Loading release data...</p>
        <p v-else-if="loadError">{{ loadError }}</p>
        <template v-else>
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


        <v-table density="compact">
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
    </div>

    <ChangelogDialog v-model="isChangelogVisible" :content="dialogChangelogContent" />


</template>
