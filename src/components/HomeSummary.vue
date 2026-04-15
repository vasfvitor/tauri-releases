<script setup lang="ts">
import { repositories } from "../../packages/releases-generator/config";

const cratesUrl = "https://crates.io/crates";
const npmUrl = "https://www.npmjs.com/package";
const shieldUrl = "https://img.shields.io";

type RenderedLink = { label: string; href: string };
type RenderedBadge = { alt: string; src: string };
type RenderedPackage = {
  description: string;
  links: RenderedLink[];
  badges: RenderedBadge[];
};
type RenderedRepo = {
  displayName: string;
  repoUrl: string;
  repoSlug: string;
  packages: RenderedPackage[];
};

const renderedRepos: RenderedRepo[] = repositories.map((repo) => ({
  displayName: repo.displayName,
  repoUrl: repo.repoUrl,
  repoSlug: repo.repoUrl.replace("https://github.com/", "").replace(/\/$/, ""),
  packages: repo.packages.map((pkg) => {
    const links: RenderedLink[] = [];
    const badges: RenderedBadge[] = [];
    const { cratesPath, npmPath } = pkg as {
      cratesPath?: string;
      npmPath?: string;
    };

    if (cratesPath) {
      const crate = cratesPath.split("/").pop();
      links.push({
        label: `${pkg.name} (crate)`,
        href: `${cratesUrl}/${crate}`,
      });
      badges.push({
        alt: "crates.io version",
        src: `${shieldUrl}/crates/v/${crate}.svg`,
      });
    }

    if (npmPath) {
      links.push({
        label: `${pkg.name} (npm)`,
        href: `${npmUrl}/${npmPath}`,
      });
      badges.push({
        alt: "npm version",
        src: `${shieldUrl}/npm/v/${npmPath}.svg`,
      });
    }

    return { description: pkg.description, links, badges };
  }),
}));
</script>

<template>
  <section class="home-summary">
    <article v-for="repo in renderedRepos" :key="repo.displayName" class="repo-block">
      <h3 class="repo-heading">
        <span>{{ repo.displayName }}</span>
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pkg, i) in repo.packages" :key="i">
            <td class="component-cell">
              <a v-for="link in pkg.links" :key="link.href" class="component-link" :href="link.href" target="_blank"
                rel="noreferrer">
                {{ link.label }}
              </a>
            </td>
            <td class="description-cell">{{ pkg.description }}</td>
            <td class="version-cell">
              <img v-for="badge in pkg.badges" :key="badge.src" class="version-badge" :src="badge.src" :alt="badge.alt"
                loading="lazy" />
            </td>
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

.version-badge {
  display: block;
  height: 20px;
}

.version-badge+.version-badge {
  margin-top: 0.25rem;
}
</style>
