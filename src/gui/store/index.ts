/**
 * Copyright 2021 NTT Corporation.
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

import Vue from "vue";
import VueI18n from "vue-i18n";
import { SettingsProvider } from "@/lib/common/settings/SettingsProvider";
import Settings from "@/lib/common/settings/Settings";
import Vuex, { StoreOptions, GetterTree, MutationTree, ActionTree } from "vuex";
import { createI18n } from "@/locale/i18n";
import { operationHistory } from "./operationHistory";
import { captureControl } from "./captureControl";
import { testManagement } from "./testManagement";
import ClientSideCaptureServiceDispatcher from "../lib/eventDispatcher/ClientSideCaptureServiceDispatcher";
import RepositoryServiceDispatcher from "../lib/eventDispatcher/RepositoryServiceDispatcher";

Vue.use(Vuex);

/**
 * Common state.
 */
export interface RootState {
  /**
   * The service that translates messages.
   */
  i18n: VueI18n | null;

  /**
   * The service that provides settings.
   */
  settingsProvider: SettingsProvider;

  /**
   * Whether the config dialog is opened or not.
   */
  openedConfigViewer: boolean;

  progressDialog: {
    opened: boolean;
    message?: string;
  };

  /**
   * The service that performs processing involving communication to the capturer.
   */
  clientSideCaptureServiceDispatcher: ClientSideCaptureServiceDispatcher;

  /**
   * The service that performs processing involving communication to the repository.
   */
  repositoryServiceDispatcher: RepositoryServiceDispatcher;
}

const getters: GetterTree<RootState, RootState> = {
  /**
   * Build and get a message that matches the locale with message key and arguments.
   * @param state State.
   * @returns Built message.
   */
  message: (state) => (message: string, args?: any) => {
    if (!state.i18n) {
      return "";
    }
    return state.i18n.t(message, args);
  },

  /**
   * Get a setting value corresponding to the key from the State.
   * @param state State.
   * @returns Setting value.
   */
  getSetting: (state) => (keyPath: string) => {
    return (state.settingsProvider as SettingsProvider).getSetting(keyPath);
  },

  /**
   * Get locale from the State.
   * @param state State.
   * @returns Locale.
   */
  getLocale: (state) => () => {
    if (!state.i18n) {
      return "";
    }
    return state.i18n.locale;
  },
};

const mutations: MutationTree<RootState> = {
  setClientSideCaptureServiceDispatcherConfig(
    state,
    payload: { serviceUrl: string }
  ) {
    state.clientSideCaptureServiceDispatcher.serviceUrl = payload.serviceUrl;
  },

  setRepositoryServiceDispatcherConfig(state, payload: { serviceUrl: string }) {
    state.repositoryServiceDispatcher.serviceUrl = payload.serviceUrl;
  },

  /**
   * Set locale to the State.
   * @param state State.
   * @param payload.locale Locale.
   */
  setLocale(state, payload: { locale: string }) {
    if (!state.i18n) {
      state.i18n = createI18n(payload.locale);
    }
    state.i18n.locale = payload.locale;
  },

  /**
   * Set common settings to the State.
   * @param state State.
   * @param payload.settings Common settings.
   */
  setSettings(state, payload: { settings: Settings }) {
    (state.settingsProvider as SettingsProvider).settings = payload.settings;
  },

  /**
   * Open the config dialog.
   * @param state State.
   */
  openConfigViewer(state) {
    state.openedConfigViewer = true;
  },

  /**
   * Close the config dialog.
   * @param state State.
   */
  closeConfigViewer(state) {
    state.openedConfigViewer = false;
  },

  /**
   * Progress dialog display settings.
   * @param state  State.
   */
  setProgressDialogOpened(state, payload: { opened: boolean }) {
    state.progressDialog = {
      opened: payload.opened,
      message: state.progressDialog.message,
    };
  },

  /**
   * Progress dialog display message settings
   * @param state State.
   */
  setProgressDialogMessage(state, payload: { message?: string } = {}) {
    state.progressDialog = {
      opened: state.progressDialog.opened,
      message: payload.message,
    };
  },
};

const actions: ActionTree<RootState, RootState> = {
  /**
   * Load a locale setting and update the State.
   * If the settings are passed as an argument, use it.
   * @param context Action context.
   * @param payload.settings Settings.
   */
  async loadLocaleFromSettings(context, payload?: { settings?: Settings }) {
    if (payload?.settings) {
      context.commit("setLocale", { locale: payload.settings.locale });
      return;
    }

    const reply = await context.rootState.repositoryServiceDispatcher.getSettings();
    if (!reply.succeeded) {
      const errorMessage = context.rootGetters.message(
        `error.common.${reply.error!.code}`
      );
      throw new Error(errorMessage);
    }

    context.commit("setLocale", { locale: reply.data!.locale });
  },

  /**
   * Change locale.
   * @param context Action context.
   * @param payload.locale Locale.
   */
  async changeLocale(context, payload: { locale: string }) {
    const reply = await context.rootState.repositoryServiceDispatcher.changeLocale(
      payload.locale
    );
    if (!reply.succeeded) {
      const errorMessage = context.rootGetters.message(
        `error.common.${reply.error!.code}`
      );
      throw new Error(errorMessage);
    }

    context.commit("setLocale", payload);
  },

  /**
   * Change the title to a format like `LatteArt - xxxxx`.
   * @param context Action context.
   * @param payload.title Character string to be added to the end of the title.
   */
  changeWindowTitle(context, payload: { title: string }) {
    const baseAppName = "LatteArt";
    document.title =
      payload.title === "" ? baseAppName : `${baseAppName} - ${payload.title}`;
  },

  /**
   * Open the progress dialog.
   * @param context Action context.
   * @param payload.message Message to display in dialog.
   */
  openProgressDialog(context, payload?: { message: string }): void {
    context.commit("setProgressDialogMessage", payload);
    context.commit("setProgressDialogOpened", { opened: true });
  },

  /**
   * Close the progress dialog.
   * @param context Action context.
   */
  closeProgressDialog(context): void {
    context.commit("setProgressDialogOpened", { opened: false });
    context.commit("setProgressDialogMessage", { message: "" });
  },
};

const store: StoreOptions<RootState> = {
  state: {
    i18n: null,
    settingsProvider: new SettingsProvider(),
    openedConfigViewer: false,
    progressDialog: {
      opened: false,
      message: "",
    },
    clientSideCaptureServiceDispatcher: new ClientSideCaptureServiceDispatcher(),
    repositoryServiceDispatcher: new RepositoryServiceDispatcher(),
  },
  getters,
  mutations,
  actions,
  modules: {
    operationHistory,
    captureControl,
    testManagement,
  },
};

export default new Vuex.Store<RootState>(store);
