import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { FlexRender } from "@tanstack/vue-table";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVuetify } from "vuetify";

import ReleaseHeader from "../../src/components/ReleaseHeader.vue";
import ReleasesTable from "../../src/components/ReleasesTable.vue";

const vuetify = createVuetify({ components, directives });

import "./styles/theme.css";
import "./styles/custom.css";
import "vuetify/styles";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.use(vuetify);

		// register your custom global components
		app.component("ReleaseHeader", ReleaseHeader);
		app.component("ReleasesTable", ReleasesTable);
		app.component("FlexRender", FlexRender);
	},
} satisfies Theme;
