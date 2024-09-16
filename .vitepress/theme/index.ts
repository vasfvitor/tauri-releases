import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ReleaseHeader from "../../src/components/ReleaseHeader.vue";


export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		// register your custom global components
		app.component("ReleaseHeader", ReleaseHeader /* ... */);
	},
} satisfies Theme;
