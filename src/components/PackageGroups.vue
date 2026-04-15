<script setup lang="ts">
import { withBase } from "vitepress";

type PackageLink = {
  name: string;
  href: string;
};

const packageLinks: PackageLink[] = [
  { name: "Tauri", href: withBase("/tauri/tauri/all_versions.html") },
  { name: "Wry", href: withBase("/wry/all_versions.html") },
  { name: "Tao", href: withBase("/tao/all_versions.html") },
  { name: "CTA", href: withBase("/create-tauri-app/all_versions.html") },
  {
    name: "Plugins",
    href: withBase("/plugins-workspace/autostart/all_versions.html"),
  },
];
</script>

<template>
  <nav class="package-links" aria-label="Package shortcuts">
    <a
      v-for="group in packageLinks"
      :key="group.href"
      class="package-link"
      :href="group.href"
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
