import { FlexRender } from "@tanstack/vue-table";
import { type Theme, useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { watchEffect } from "vue";

import { createVuetify } from "vuetify";
import {
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VCol,
  VDialog,
  VDivider,
  VRow,
  VSelect,
  VTable,
  VTextField,
} from "vuetify/components";

import ReleaseHeader from "../../src/components/ReleaseHeader.vue";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
  },
  components: {
    VBtn,
    VCard,
    VCardText,
    VCardTitle,
    VCol,
    VDialog,
    VDivider,
    VRow,
    VSelect,
    VTable,
    VTextField,
  },
});

// import "./styles/theme.css";
import "./styles/custom.css";
import "vuetify/styles";

export default {
  extends: DefaultTheme,
  setup() {
    const { isDark } = useData();

    watchEffect(() => {
      vuetify.theme.change(isDark.value ? "dark" : "light");
    });
  },
  enhanceApp({ app }) {
    app.use(vuetify);
    // register your custom global components
    app.component("ReleaseHeader", ReleaseHeader);
    app.component("FlexRender", FlexRender);
  },
} satisfies Theme;
