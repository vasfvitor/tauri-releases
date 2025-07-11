import { defineConfig } from "vitepress";

import {
	generateSidebar,
	type VitePressSidebarOptions,
} from "vitepress-sidebar";

const srcDir = "src/content";

// https://vitepress-sidebar.cdget.com/guide/getting-started
const vitepressSidebarOptions: VitePressSidebarOptions = {
	collapsed: true,
	collapseDepth: 1,
	documentRootPath: srcDir,
	sortMenusByFrontmatterOrder: true,
	useTitleFromFrontmatter: true,
	frontmatterTitleFieldName: "sidebar",
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Tauri Releases",
	description: "A VitePress Site",
	srcDir,
	vite: {
		ssr: {
			noExternal: [/\.css$/, /\?vue&type=style/, /^vuetify/],
		},
		// build: {
		// 	rollupOptions: {
		// 		output: {
		// 			manualChunks(id) {
		// 				if (id.includes("node_modules")) {
		// 					if (id.includes("vue")) return "vue-vendor";
		// 					if (id.includes("vuetify")) return "vuetify-vendor";
		// 					return "vendor";
		// 				}
		// 			},
		// 		},
		// 	},
		// },
	},
	metaChunk:true,
	themeConfig: {
		search: {
			provider: "local",
		},
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Documentation", link: "https://tauri.app/" },
		],

		sidebar: generateSidebar(vitepressSidebarOptions),

		socialLinks: [
			{ icon: "github", link: "https://github.com/tauri-apps/tauri" },
			{ icon: "discord", link: "https://discord.com/invite/tauri" },
			{ icon: "twitter", link: "https://twitter.com/TauriApps" },
			{ icon: "mastodon", link: "https://fosstodon.org/@TauriApps" },
		],
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
});
