<script setup lang="ts">
import { withBase } from "vitepress";
import { buildPackageGroupLinks } from "../../packages/releases-generator/uiData";
import { repositories } from "../../packages/releases-generator/config";

const packageLinks = buildPackageGroupLinks(repositories);
</script>

<template>
  <nav class="package-links" aria-label="Package shortcuts">
    <a
      v-for="group in packageLinks"
      :key="group.href"
      class="package-link"
      :href="withBase(group.href)"
    >
      {{ group.name }}
    </a>
  </nav>
</template>

<style scoped>
.package-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 0.9rem;
  margin: 0 0 1.5rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.package-link {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  text-decoration: none;
}

.package-link:hover,
.package-link:focus-visible {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.package-link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
