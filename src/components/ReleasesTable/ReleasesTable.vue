<script setup lang="ts">
import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { subMonths } from "date-fns";
import { computed, onMounted, ref, watch } from "vue";
import type { TableData } from "../../../packages/releases-generator/types";
import { loadReleaseData } from "../releaseData";
// biome-ignore lint/correctness/noUnusedImports: Used by the Vue template.
import ChangelogDialog from "./ChangelogDialog.vue";
import { createColumns } from "./columns";
import { buildMajorGroups, sortReleasesByDateDesc } from "./releaseRows";

const repoList = ref<string[]>([]);
const packages = ref<Record<string, string[]>>({});
const data = ref<TableData[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const viewMode = ref<"date" | "major">("date");
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const viewModes = [
  { title: "By date", value: "date" },
  { title: "By major", value: "major" },
];

// filters
const lastMonth = subMonths(new Date(), 1);
const filterDate = ref<string | null>(lastMonth.toISOString().split("T")[0]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<ColumnVisibilityState>({ date: false });
const selectedRepo = ref<string>("");
const selectedProjects = ref<string[]>([]);

const defaultRepo = computed(() => repoList.value[0] ?? "");
const defaultProjects = computed(() => packages.value[defaultRepo.value] ?? []);
const lastMonthIso = lastMonth.toISOString().split("T")[0];

const filteredPackages = computed(() => {
  return packages.value[selectedRepo.value] || [];
});
const sortedData = computed(() => sortReleasesByDateDesc(data.value));

// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const totalRows = computed(() => data.value.length);
const visibleRows = computed(() => table.getRowModel().rows.length);
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const majorGroups = computed(() => {
  const rows = table.getRowModel().rows;
  const rowByRelease = new Map(rows.map((row) => [row.original, row]));

  return buildMajorGroups(rows.map((row) => row.original)).map((group) => ({
    label: group.label,
    rows: group.rows
      .map((release) => rowByRelease.get(release))
      .filter((row) => row !== undefined),
  }));
});
const activeFilterCount = computed(() => {
  let count = 0;

  if (selectedRepo.value && selectedRepo.value !== defaultRepo.value) {
    count += 1;
  }

  const currentProjects =
    selectedProjects.value.length === filteredPackages.value.length &&
    selectedProjects.value.every((item) =>
      filteredPackages.value.includes(item),
    );

  if (!currentProjects) {
    count += 1;
  }

  if (filterDate.value && filterDate.value !== lastMonthIso) {
    count += 1;
  }

  return count;
});
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const hasActiveFilters = computed(() => activeFilterCount.value > 0);
// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
const hasResults = computed(() => visibleRows.value > 0);

// biome-ignore lint/correctness/noUnusedVariables: Used by the Vue template.
function resetFilters() {
  selectedRepo.value = defaultRepo.value;
  selectedProjects.value = [...defaultProjects.value];
  filterDate.value = lastMonthIso;
}

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
    return sortedData.value;
  },
  columns: createColumns(showChangelogPopup),
  state: {
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
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
    table.getColumn("date")?.setFilterValue(since ?? undefined);
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    const payload = await loadReleaseData();
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
  <div class="vp-raw releases-table">
    <p v-if="isLoading" class="table-state table-state-loading">
      Loading...
    </p>
    <p v-else-if="loadError" class="table-state table-state-error">
      {{ loadError }}
    </p>
    <template v-else>
      <div class="table-toolbar">
        <div class="table-summary">
          <span class="table-summary-count">
            {{ visibleRows }} of {{ totalRows }} releases
          </span>
          <span class="table-summary-detail">
            {{ activeFilterCount }} active filter{{ activeFilterCount === 1 ? "" : "s" }}
          </span>
        </div>
        <v-btn
          v-if="hasActiveFilters"
          class="table-reset"
          variant="text"
          size="small"
          @click="resetFilters"
        >
          Reset filters
        </v-btn>
      </div>

      <v-row class="table-filters">
        <v-col cols="12" sm="4">
          <v-select v-model="selectedRepo" :items="repoList" label="Repository" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="selectedProjects"
            :items="filteredPackages"
            label="Projects"
            multiple
          >
            <template #selection="{ item, index }">
              <template v-if="index < 2">{{ item.title }}</template>
              <span v-if="index === 2">(+{{ selectedProjects.length - 2 }})</span>
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" sm="4">
          <v-select v-model="viewMode" :items="viewModes" label="View" />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="filterDate"
            class="table-date-filter"
            type="date"
            label="Since"
          />
        </v-col>
      </v-row>

      <div v-if="!hasResults" class="table-empty">
        <p class="table-empty-title">No matching releases.</p>
        <p class="table-empty-body">
          Widen the date range or reset filters.
        </p>
        <v-btn variant="outlined" @click="resetFilters">Reset filters</v-btn>
      </div>

      <v-table v-else class="release-data-table" density="compact">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>
        <tbody v-if="viewMode === 'date'">
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <template v-for="group in majorGroups" :key="group.label">
            <tr class="release-major-row">
              <td :colspan="table.getVisibleFlatColumns().length">
                {{ group.label }}
              </td>
            </tr>
            <tr v-for="row in group.rows" :key="row.id">
              <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </template>
  </div>

  <ChangelogDialog v-model="isChangelogVisible" :content="dialogChangelogContent" />
</template>

<style scoped>
.releases-table {
  color: var(--vp-c-text-1);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 0 1rem;
}

.table-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.75rem;
}

.table-summary-count {
  font-weight: 600;
}

.table-summary-detail {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.table-filters {
  margin-bottom: 0.75rem;
}

.table-date-filter {
  max-width: 20rem;
}

.table-state {
  margin: 1rem 0;
  color: var(--vp-c-text-2);
}

.table-state-loading {
  padding: 0.75rem 0;
}

.table-state-error {
  color: var(--vp-c-danger-1);
}

.table-empty {
  padding: 1rem;
  margin-top: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.table-empty-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
}

.table-empty-body {
  margin: 0 0 1rem;
  color: var(--vp-c-text-2);
}

.release-data-table {
  background: transparent;
  width: 100%;
}

.release-data-table :deep(.v-table__wrapper) {
  width: 100%;
}

.release-data-table :deep(table) {
  width: 100%;
}

.release-data-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.release-data-table :deep(tbody tr:hover) {
  background: var(--vp-c-bg-soft);
}

.release-data-table :deep(.release-version) {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
}

.release-data-table :deep(.release-version-number) {
  font-weight: 600;
}

.release-data-table :deep(.release-version-date) {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 400;
}

.release-major-row td {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0;
  background: var(--vp-c-bg-soft);
}

.release-data-table :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.release-data-table :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .table-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .table-date-filter {
    max-width: none;
  }
}
</style>
