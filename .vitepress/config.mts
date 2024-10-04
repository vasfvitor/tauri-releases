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
});
