import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ReleaseHeader from "../../src/components/ReleaseHeader.vue";

import "./styles/theme.css";
import "./styles/custom.css";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		// register your custom global components
		app.component("ReleaseHeader", ReleaseHeader);
	},
} satisfies Theme;
    