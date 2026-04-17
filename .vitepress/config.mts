import { readFileSync } from "node:fs";
import { defineConfig } from "vitepress";

const srcDir = "src/content";

const sidebarData = JSON.parse(
  readFileSync("src/content/public/sidebar.json", "utf-8"),
);

// https://vitepress.dev/reference/site-config
export default defineConfig({
  description: "Tauri 2 releases changelog",
  srcDir,
  metaChunk: true,
  base: "/tauri-releases/",
  head: [
    [
      "link",
      { rel: "prefetch", href: "/tauri-releases/tableData.json", as: "fetch" },
    ],
  ],
  themeConfig: {
    sidebar: sidebarData,
    siteTitle: false,
    logo: { dark: "/logo.svg", light: "/logo_light.svg" },
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Documentation", link: "https://tauri.app/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/tauri-apps/tauri" },
      { icon: "discord", link: "https://discord.com/invite/tauri" },
      { icon: "twitter", link: "https://twitter.com/TauriApps" },
      { icon: "mastodon", link: "https://fosstodon.org/@TauriApps" },
    ],
    externalLinkIcon: true,
  },

  ignoreDeadLinks: [
    "/playground",
    // ignore all localhost links
    /^https?:\/\/localhost/,
    // custom function, ignore all links include "ignore"
    (url) => {
      return url.toLowerCase().includes("ignore");
    },
  ],
  vite: {
    ssr: {
      noExternal: [/\.css$/, /\?vue&type=style/, /^vuetify/],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("vuetify")) return "vuetify";
              if (id.includes("@tanstack")) return "table";
              if (id.includes("date-fns")) return "date";
            }
          },
        },
      },
    },
  },
});
