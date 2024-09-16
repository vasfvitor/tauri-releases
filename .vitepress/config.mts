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
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Tauri Releases",
	description: "A VitePress Site",
	srcDir,
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Examples", link: "/markdown-examples" },
		],

		sidebar: generateSidebar(vitepressSidebarOptions),

		socialLinks: [
			{ icon: "github", link: "https://github.com/vuejs/vitepress" },
		],
	},
});
