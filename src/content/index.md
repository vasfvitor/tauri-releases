---
title: 'Tauri Releases'
order: 1
aside: false
---

<script setup lang="ts">
import HomeSummary from '../components/HomeSummary.vue';
import PackageGroups from '../components/PackageGroups.vue';
import ReleasesTable from '../components/ReleasesTable/ReleasesTable.vue';
</script>

# Tauri Releases

<HomeSummary />

<PackageGroups />

<ClientOnly>
  <ReleasesTable />
</ClientOnly>
