import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ReleaseHeader from "../../src/components/ReleaseHeader.vue";
import ReleasesTable from "../../src/components/ReleasesTable.vue";

import "./styles/theme.css";
import "./styles/custom.css";
import { FlexRender } from "@tanstack/vue-table";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		// register your custom global components
		app.component("ReleaseHeader", ReleaseHeader);
		app.component("ReleasesTable", ReleasesTable);
		app.component("FlexRender", FlexRender);
	},
} satisfies Theme;
