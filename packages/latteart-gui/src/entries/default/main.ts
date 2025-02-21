/**
 * Copyright 2025 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createApp } from "vue";
import App from "./App.vue";
import { useRootStore } from "@/stores/root";
import { createCaptureClService } from "latteart-client";
import type { I18nProvider } from "@/lib/common/internationalization";
import { createDefaultRouter } from "@/plugins/router";
import vuetify from "@/plugins/vuetify";
import pinia from "@/plugins/pinia";
import { createI18n } from "@/plugins/i18n";
import defaultMessages from "@/messages";
import { extensions } from "@/extensions";

const app = createApp(App);

const router = createDefaultRouter();
const i18n = createI18n(defaultMessages, ...extensions.map((extension) => extension.messages));

app.use(router);
app.use(vuetify);
app.use(pinia);
app.use(i18n);

for (const plugin of extensions.map((extension) => extension.plugin)) {
  app.use(plugin);
}

app.provide("isViewerMode", false);

// initialize store
const i18nProvider: I18nProvider = {
  message(message: string, args?: { [key: string]: string }) {
    return (i18n.global as any).t(message, args ?? {});
  },

  getLocale() {
    return i18n.global.locale;
  },

  setLocale(locale) {
    i18n.global.locale = locale;
  }
};

const queryStr = window.location.search.slice(1);

let repository = "";
let capture = "";

queryStr.split("&").forEach((q) => {
  const kv = q.split("=");
  if (kv[0] === "repository") {
    repository = kv[1];
  }
  if (kv[0] === "capture") {
    capture = kv[1];
  }
});

(async () => {
  const rootStore = useRootStore();
  rootStore.i18nProvider = i18nProvider;

  if (capture) {
    rootStore.captureClService = createCaptureClService(capture);
  }

  await rootStore.connectRepository({
    targetUrl: repository ? repository : "http://127.0.0.1:3002"
  });

  app.mount("#app");
})();
