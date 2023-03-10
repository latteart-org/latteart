/**
 * Copyright 2022 NTT Corporation.
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
import {
  ProjectSettings,
  DeviceSettings,
  ViewSettings,
} from "@/lib/common/settings/Settings";
import Vuex, { StoreOptions, GetterTree, MutationTree, ActionTree } from "vuex";
import { createI18n } from "@/locale/i18n";
import { operationHistory } from "./operationHistory";
import { captureControl } from "./captureControl";
import { testManagement } from "./testManagement";
import { SaveLocaleAction } from "@/lib/common/settings/SaveLocaleAction";
import { ReadLocaleAction } from "@/lib/common/settings/ReadLocaleAction";
import {
  RepositoryService,
  createRepositoryService,
  CaptureClService,
  createCaptureClService,
  TestScriptOption,
  RESTClientImpl,
} from "latteart-client";
import { ReadDeviceSettingAction } from "@/lib/common/settings/ReadDeviceSettingAction";
import { SaveDeviceSettingAction } from "@/lib/common/settings/SaveDeviceSettingAction";
import { SaveSettingAction } from "@/lib/common/settings/SaveSettingAction";
import { ReadSettingAction } from "@/lib/common/settings/ReadSettingAction";
import { ExportConfigAction } from "@/lib/operationHistory/actions/ExportConfigAction";

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
   * Settings.
   */
  projectSettings: ProjectSettings;

  /**
   * GUI Settings.
   */
  viewSettings: ViewSettings;

  /**
   * Capture config.
   */
  deviceSettings: DeviceSettings;

  /**
   * Whether the config dialog is opened or not.
   */
  openedConfigViewer: boolean;

  progressDialog: {
    opened: boolean;
    message?: string;
  };

  repositoryUrls: string[];

  captureClService: CaptureClService;

  repositoryService: RepositoryService;
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
  setCaptureClServiceDispatcherConfig(state, payload: { serviceUrl: string }) {
    state.captureClService = createCaptureClService(payload.serviceUrl);
  },

  registerRepositoryServiceUrl(state, payload: { url: string }) {
    const oldUrls = state.repositoryUrls;

    if (!oldUrls.includes(payload.url)) {
      const newUrls = [...oldUrls, payload.url];
      setRepositoryUrlsToLocalStorage(newUrls);

      state.repositoryUrls = [...newUrls];
    }
  },

  setRepositoryServiceUrl(state, payload: { url: string }) {
    state.repositoryService = createRepositoryService(
      new RESTClientImpl(payload.url)
    );
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
  setProjectSettings(
    state,
    payload: {
      settings: Omit<ProjectSettings, "config"> & {
        config: Partial<ProjectSettings["config"]>;
      };
    }
  ) {
    Object.assign(state.projectSettings.config, payload.settings.config);
    state.projectSettings.defaultTagList = payload.settings.defaultTagList;
    state.projectSettings.viewPointsPreset = payload.settings.viewPointsPreset;
  },

  setViewSettings(
    state,
    payload: {
      settings: ViewSettings;
    }
  ) {
    state.viewSettings = payload.settings;
  },

  setDeviceSettings(state, payload: { deviceSettings: DeviceSettings }) {
    Vue.set(state, "deviceSettings", payload.deviceSettings);
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
  async loadLocaleFromSettings(context) {
    const result = await new ReadLocaleAction().readLocale();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    if (result.data) {
      context.commit("setLocale", { locale: result.data });
    }
  },

  /**
   * Change locale.
   * @param context Action context.
   * @param payload.locale Locale.
   */
  async changeLocale(context, payload: { locale: string }) {
    const saveLocaleActionResult = await new SaveLocaleAction().saveLocale(
      payload.locale
    );

    if (saveLocaleActionResult.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          saveLocaleActionResult.error.messageKey,
          saveLocaleActionResult.error.variables
        )
      );
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

  async connectRepository(context, payload: { targetUrl: string }) {
    const serverUrl = payload.targetUrl;

    const serverName = (
      await new RESTClientImpl(serverUrl)
        .httpGet("api/v1/server-name")
        .catch(() => {
          return { data: "" };
        })
    ).data as string;

    if (serverName !== "latteart-repository") {
      console.error(`'${serverUrl}' is not latteart-repository.`);

      throw new Error(
        context.rootGetters.message("remote-access.connect-remote-url-error")
      );
    }

    context.commit("setRepositoryServiceUrl", { url: serverUrl });

    context.commit("registerRepositoryServiceUrl", {
      url: serverUrl,
    });

    return serverUrl;
  },

  /**
   * Load Project Settings.
   * If the settings are passed as an argument, use it.
   * @param context Action context.
   * @param payload.settings Settings.
   */
  async readSettings(context) {
    const result = await new ReadSettingAction(
      context.rootState.repositoryService
    ).readProjectSettings();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit(
      "setProjectSettings",
      { settings: result.data },
      { root: true }
    );
  },

  /**
   * Save Project Settings.
   * @param context Action context.
   * @param payload.config Settings.
   */
  async writeProjectSettings(
    context,
    payload: { settings: Partial<ProjectSettings> }
  ) {
    const settings: ProjectSettings = {
      config:
        payload.settings.config ?? context.rootState.projectSettings.config,
      defaultTagList:
        payload.settings.defaultTagList ??
        context.rootState.projectSettings.defaultTagList,
      viewPointsPreset:
        payload.settings.viewPointsPreset ??
        context.rootState.projectSettings.viewPointsPreset,
    };

    const result = await new SaveSettingAction(
      context.rootState.repositoryService
    ).saveProjectSettings(settings);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit(
      "setProjectSettings",
      { settings: result.data },
      { root: true }
    );
  },

  async writeConfig(
    context,
    payload: { config: Partial<ProjectSettings["config"]> }
  ) {
    const settings: Partial<ProjectSettings> = {
      config: {
        autofillSetting:
          payload.config.autofillSetting ??
          context.rootState.projectSettings.config.autofillSetting,
        autoOperationSetting:
          payload.config.autoOperationSetting ??
          context.rootState.projectSettings.config.autoOperationSetting,
        screenDefinition:
          payload.config.screenDefinition ??
          context.rootState.projectSettings.config.screenDefinition,
        coverage:
          payload.config.coverage ??
          context.rootState.projectSettings.config.coverage,
        imageCompression:
          payload.config.imageCompression ??
          context.rootState.projectSettings.config.imageCompression,
        testResultComparison:
          payload.config.testResultComparison ??
          context.rootState.projectSettings.config.testResultComparison,
      },
    };

    await context.dispatch("writeProjectSettings", { settings });
  },

  async readViewSettings(context) {
    const result = await new ReadSettingAction(
      context.rootState.repositoryService
    ).readViewSettings();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit(
      "setViewSettings",
      { settings: result.data },
      { root: true }
    );
  },

  async writeViewSettings(context, payload: { viewSettings: ViewSettings }) {
    const result = await new SaveSettingAction(
      context.rootState.repositoryService
    ).saveViewSettings(payload.viewSettings);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit(
      "setViewSettings",
      { settings: result.data },
      { root: true }
    );
  },

  async readTestScriptOption(context) {
    const result = await new ReadSettingAction(
      context.rootState.repositoryService
    ).readTestScriptOption();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },

  async writeTestScriptOption(
    context,
    payload: { option: Pick<TestScriptOption, "buttonDefinitions"> }
  ) {
    const result = await new SaveSettingAction(
      context.rootState.repositoryService
    ).saveTestScriptOption(payload.option);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }
  },

  /**
   * Load Device Settings.
   * @param context Action context.
   */
  async readDeviceSettings(context) {
    const result = await new ReadDeviceSettingAction().readDeviceSettings();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit(
      "setDeviceSettings",
      { deviceSettings: result.data.config },
      { root: true }
    );
  },

  /**
   * Save Device Settings.
   * @param context Action context.
   * @param payload.config Capture config.
   */
  async writeDeviceSettings(
    context,
    payload: { config: Partial<DeviceSettings> }
  ) {
    const deviceSettings: { config: DeviceSettings } = {
      config: {
        platformName:
          payload.config.platformName ??
          context.rootState.deviceSettings.platformName,
        browser:
          payload.config.browser ?? context.rootState.deviceSettings.browser,
        device:
          payload.config.device ?? context.rootState.deviceSettings.device,
        platformVersion:
          payload.config.platformVersion ??
          context.rootState.deviceSettings.platformName,
        waitTimeForStartupReload:
          payload.config.waitTimeForStartupReload ??
          context.rootState.deviceSettings.waitTimeForStartupReload,
      },
    };

    const result = await new SaveDeviceSettingAction().saveDeviceSettings(
      deviceSettings
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit(
      "setDeviceSettings",
      { deviceSettings: result.data.config },
      { root: true }
    );
  },

  /**
   * Export Project Settings.
   * @param context Action context.
   */
  async exportProjectSettings(context) {
    const result = await new ExportConfigAction(
      context.rootState.repositoryService
    ).exportSettings();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },
};

function getRepositoryUrlsFromLocalStorage(): string[] {
  const repositoryUrlsStr =
    localStorage.getItem("latteart-config-remoteRepositoryUrls") ?? "[]";
  return JSON.parse(repositoryUrlsStr);
}

function setRepositoryUrlsToLocalStorage(urls: string[]) {
  localStorage.setItem(
    "latteart-config-remoteRepositoryUrls",
    JSON.stringify(urls)
  );
}

const store: StoreOptions<RootState> = {
  state: {
    i18n: null,
    projectSettings: {
      viewPointsPreset: [],
      defaultTagList: [],
      config: {
        autofillSetting: {
          conditionGroups: [],
        },
        autoOperationSetting: {
          conditionGroups: [],
        },
        screenDefinition: {
          screenDefType: "title",
          conditionGroups: [],
        },
        coverage: {
          include: {
            tags: [],
          },
        },
        imageCompression: {
          isEnabled: true,
          isDeleteSrcImage: true,
        },
        testResultComparison: {
          excludeItems: {
            isEnabled: false,
            values: [],
          },
          excludeElements: {
            isEnabled: false,
            values: [],
          },
        },
      },
    },
    viewSettings: {
      autofill: {
        autoPopupRegistrationDialog: false,
        autoPopupSelectionDialog: false,
      },
    },
    deviceSettings: {
      platformName: "PC",
      browser: "Chrome",
      waitTimeForStartupReload: 0,
    },
    openedConfigViewer: false,
    progressDialog: {
      opened: false,
      message: "",
    },
    repositoryUrls: getRepositoryUrlsFromLocalStorage(),
    captureClService: createCaptureClService("http://127.0.0.1:3001"),
    repositoryService: createRepositoryService(
      new RESTClientImpl("http://127.0.0.1:3002")
    ),
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
