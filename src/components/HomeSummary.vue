<script setup lang="ts">
import { repositories } from "../../packages/releases-generator/config";
import { buildHomeSummaryRepos } from "../../packages/releases-generator/uiData";
import { latestVersions } from "../../packages/releases-generator/generated/latestVersions";

const renderedRepos = buildHomeSummaryRepos(repositories, latestVersions);
</script>

<template>
  <section class="home-summary">
    <article v-for="repo in renderedRepos" :key="repo.displayName" class="repo-block">
      <h3 class="repo-heading">
        {{ repo.displayName }}
        <a class="repo-slug" :href="repo.repoUrl" target="_blank" rel="noreferrer">
          {{ repo.repoSlug }}
        </a>
      </h3>


      <table class="repo-table">
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Description</th>
            <th scope="col">Version</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pkg, i) in repo.packages" :key="i">
            <td class="component-cell">
              <a v-for="link in pkg.links" :key="link.href" class="component-link" :href="link.href" target="_blank"
                rel="noreferrer">
                {{ link.name }}
              </a>
            </td>
            <td class="description-cell">{{ pkg.description }}</td>
            <td class="version-cell">
              <span v-for="pill in pkg.versions" :key="`${pill.label}-${pill.version}`" class="version-pill"
                :class="`version-pill--${pill.label}`">
                <span class="version-pill__label">{{ pill.label }}</span>
                <span class="version-pill__value">{{ pill.version }}</span>
              </span>
            </td>
            <td class="release-date-cell">{{ pkg.latestReleaseDateLabel || "-" }}</td>
          </tr>
        </tbody>
      </table>

    </article>
  </section>
</template>

<style scoped>
.home-summary {
  display: grid;
  gap: 1.75rem;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
}

.repo-block {
  display: grid;
  gap: 0.6rem;
}

.repo-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.75rem;
  margin: 0;
  padding-top: 0;
  border-top: none;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.25;
}

.repo-slug {
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.repo-slug:hover,
.repo-slug:focus-visible {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.repo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.repo-table th,
.repo-table td {
  padding: 0.55rem 0.85rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--vp-c-divider);
}

.repo-table thead th {
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--vp-c-bg-soft);
}

.repo-table tbody tr:last-child td {
  border-bottom: none;
}

.repo-table tbody tr:hover {
  background: var(--vp-c-bg-soft);
}

.component-cell,
.version-cell {
  white-space: nowrap;
}

.release-date-cell {
  white-space: nowrap;
  color: var(--vp-c-text-2);
}

.component-link {
  display: block;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
}

.component-link+.component-link {
  margin-top: 0.2rem;
}

.component-link:hover,
.component-link:focus-visible {
  text-decoration: underline;
}

.description-cell {
  color: var(--vp-c-text-2);
  min-width: 16rem;
}

.version-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 0.35rem;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
  margin-right: 0.35rem;
  margin-bottom: 0.2rem;
  border: 1px solid var(--vp-c-divider);
}

.version-pill__label,
.version-pill__value {
  padding: 0.35rem 0.5rem;
}

.version-pill__label {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.version-pill__value {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.version-pill--npm .version-pill__value {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}
</style>
