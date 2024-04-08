/**
 * Copyright 2023 NTT Corporation.
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

import type { DataLoader } from "@/lib/common/dataLoader";
import type { I18nProvider } from "@/lib/common/internationalization";
import { ReadDeviceSettingAction } from "@/lib/common/settings/ReadDeviceSettingAction";
import { ReadLocaleAction } from "@/lib/common/settings/ReadLocaleAction";
import { ReadSettingAction } from "@/lib/common/settings/ReadSettingAction";
import { SaveDeviceSettingAction } from "@/lib/common/settings/SaveDeviceSettingAction";
import { SaveLocaleAction } from "@/lib/common/settings/SaveLocaleAction";
import { SaveSettingAction } from "@/lib/common/settings/SaveSettingAction";
import type { DeviceSettings, ProjectSettings, ViewSettings } from "@/lib/common/settings/Settings";
import { ExportConfigAction } from "@/lib/operationHistory/actions/ExportConfigAction";
import {
  RESTClientImpl,
  createCaptureClService,
  createRepositoryService,
  type CaptureClService,
  type RepositoryService,
  type TestScriptOption
} from "latteart-client";
import { defineStore } from "pinia";

/**
 * Common state.
 */
type RootState = {
  i18nProvider: I18nProvider | null;

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

  progressDialog: {
    opened: boolean;
    message?: string;
  };

  repositoryUrls: string[];

  captureClService: CaptureClService;

  repositoryService: RepositoryService | null;

  dataLoader: DataLoader | null;
};

export const useRootStore = defineStore("root", {
  state: (): RootState => ({
    i18nProvider: null,
    projectSettings: {
      viewPointsPreset: [],
      defaultTagList: [],
      config: {
        autofillSetting: {
          conditionGroups: []
        },
        autoOperationSetting: {
          conditionGroups: []
        },
        screenDefinition: {
          screenDefType: "title",
          conditionGroups: []
        },
        coverage: {
          include: {
            tags: []
          }
        },
        captureMediaSetting: {
          mediaType: "image",
          imageCompression: { format: "png" }
        },
        testResultComparison: {
          excludeItems: {
            isEnabled: false,
            values: []
          },
          excludeElements: {
            isEnabled: false,
            values: []
          }
        },
        experimentalFeatureSetting: { captureArch: "polling" }
      }
    },
    viewSettings: {
      autofill: {
        autoPopupRegistrationDialog: false,
        autoPopupSelectionDialog: false
      }
    },
    deviceSettings: {
      platformName: "PC",
      browser: "Chrome",
      waitTimeForStartupReload: 0
    },
    progressDialog: {
      opened: false,
      message: ""
    },
    repositoryUrls: getRepositoryUrlsFromLocalStorage(),
    captureClService: createCaptureClService("http://127.0.0.1:3001"),
    repositoryService: null,
    dataLoader: null
  }),
  getters: {
    /**
     * Build and get a message that matches the locale with message key and arguments.
     * @param state State.
     * @returns Built message.
     */
    message: (state) => (message: string, args?: { [key: string]: string }) => {
      if (!state.i18nProvider) {
        return "";
      }
      return state.i18nProvider.message(message, args);
    },

    /**
     * Get locale from the State.
     * @param state State.
     * @returns Locale.
     */
    getLocale: (state) => () => {
      if (!state.i18nProvider) {
        return "";
      }
      return state.i18nProvider.getLocale();
    }
  },
  actions: {
    setCaptureClServiceDispatcherConfig(payload: { serviceUrl: string }) {
      this.captureClService = createCaptureClService(payload.serviceUrl);
    },

    registerRepositoryServiceUrl(payload: { url: string }) {
      const oldUrls = this.repositoryUrls;

      if (!oldUrls.includes(payload.url)) {
        const newUrls = [...oldUrls, payload.url];
        setRepositoryUrlsToLocalStorage(newUrls);

        this.repositoryUrls = [...newUrls];
      }
    },

    setRepositoryServiceUrl(payload: { url: string }) {
      this.repositoryService = createRepositoryService(new RESTClientImpl(payload.url));
    },

    /**
     * Set locale to the State.
     * @param state State.
     * @param payload.locale Locale.
     */
    setLocale(payload: { locale: "ja" | "en" }) {
      if (!this.i18nProvider) {
        return;
      }

      this.i18nProvider.setLocale(payload.locale);
    },

    /**
     * Set common settings to the State.
     * @param state State.
     * @param payload.settings Common settings.
     */
    setProjectSettings(payload: {
      settings: Omit<ProjectSettings, "config"> & {
        config: Partial<ProjectSettings["config"]>;
      };
    }) {
      Object.assign(this.projectSettings.config, payload.settings.config);
      this.projectSettings.defaultTagList = payload.settings.defaultTagList;
      this.projectSettings.viewPointsPreset = payload.settings.viewPointsPreset;
    },

    /**
     * Progress dialog display settings.
     * @param state  State.
     */
    setProgressDialogOpened(payload: { opened: boolean }) {
      this.progressDialog = {
        opened: payload.opened,
        message: this.progressDialog.message
      };
    },

    /**
     * Progress dialog display message settings
     * @param state State.
     */
    setProgressDialogMessage(payload: { message?: string } = {}) {
      this.progressDialog = {
        opened: this.progressDialog.opened,
        message: payload.message
      };
    },

    /**
     * Load a locale setting and update the State.
     * If the settings are passed as an argument, use it.
     * @param context Action context.
     * @param payload.settings Settings.
     */
    async loadLocaleFromSettings() {
      const result = await new ReadLocaleAction().readLocale();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      if ((result.data && result.data === "ja") || result.data === "en") {
        this.setLocale({ locale: result.data });
      }
    },

    /**
     * Change locale.
     * @param context Action context.
     * @param payload.locale Locale.
     */
    async changeLocale(payload: { locale: string }) {
      const saveLocaleActionResult = await new SaveLocaleAction().saveLocale(payload.locale);

      if (saveLocaleActionResult.isFailure()) {
        throw new Error(
          this.message(
            saveLocaleActionResult.error.messageKey,
            saveLocaleActionResult.error.variables ?? {}
          )
        );
      }

      if (payload.locale === "ja" || payload.locale === "en") {
        this.setLocale({ locale: payload.locale });
      }
    },

    /**
     * Change the title to a format like `LatteArt - xxxxx`.
     * @param context Action context.
     * @param payload.title Character string to be added to the end of the title.
     */
    changeWindowTitle(payload: { title: string }) {
      const baseAppName = "LatteArt";
      document.title = payload.title === "" ? baseAppName : `${baseAppName} - ${payload.title}`;
    },

    /**
     * Open the progress dialog.
     * @param context Action context.
     * @param payload.message Message to display in dialog.
     */
    openProgressDialog(payload?: { message: string }): void {
      this.setProgressDialogMessage(payload);
      this.setProgressDialogOpened({ opened: true });
    },

    /**
     * Close the progress dialog.
     * @param context Action context.
     */
    closeProgressDialog(): void {
      this.setProgressDialogOpened({ opened: false });
      this.setProgressDialogMessage({ message: "" });
    },

    async connectRepository(payload: { targetUrl: string }) {
      const serverUrl = payload.targetUrl;

      const serverName = (
        await new RESTClientImpl(serverUrl).httpGet("api/v1/server-name").catch(() => {
          return { data: "" };
        })
      ).data as string;

      if (serverName !== "latteart-repository") {
        console.error(`'${serverUrl}' is not latteart-repository.`);

        throw new Error(this.message("remote-access.connect-remote-url-error"));
      }

      this.setRepositoryServiceUrl({ url: serverUrl });

      this.registerRepositoryServiceUrl({
        url: serverUrl
      });

      return serverUrl;
    },

    /**
     * Load Project Settings.
     * If the settings are passed as an argument, use it.
     * @param context Action context.
     * @param payload.settings Settings.
     */
    async readSettings() {
      const settings = await this.dataLoader?.loadProjectSettings();

      if (!settings) {
        throw new Error();
      }

      this.setProjectSettings({ settings });
    },

    /**
     * Save Project Settings.
     * @param context Action context.
     * @param payload.config Settings.
     */
    async writeProjectSettings(payload: { settings: Partial<ProjectSettings> }) {
      if (!this.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const settings: ProjectSettings = {
        config: payload.settings.config ?? this.projectSettings.config,
        defaultTagList: payload.settings.defaultTagList ?? this.projectSettings.defaultTagList,
        viewPointsPreset: payload.settings.viewPointsPreset ?? this.projectSettings.viewPointsPreset
      };

      const result = await new SaveSettingAction().saveProjectSettings(
        settings,
        this.repositoryService
      );

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.setProjectSettings({ settings: result.data });
    },

    async writeConfig(payload: { config: Partial<ProjectSettings["config"]> }) {
      const settings: Partial<ProjectSettings> = {
        config: {
          autofillSetting:
            payload.config.autofillSetting ?? this.projectSettings.config.autofillSetting,
          autoOperationSetting:
            payload.config.autoOperationSetting ?? this.projectSettings.config.autoOperationSetting,
          screenDefinition:
            payload.config.screenDefinition ?? this.projectSettings.config.screenDefinition,
          coverage: payload.config.coverage ?? this.projectSettings.config.coverage,
          captureMediaSetting:
            payload.config.captureMediaSetting ?? this.projectSettings.config.captureMediaSetting,
          testResultComparison:
            payload.config.testResultComparison ?? this.projectSettings.config.testResultComparison,
          experimentalFeatureSetting:
            payload.config.experimentalFeatureSetting ??
            this.projectSettings.config.experimentalFeatureSetting
        }
      };

      await this.writeProjectSettings({ settings });
    },

    async readViewSettings() {
      const result = await new ReadSettingAction().readViewSettings();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.viewSettings = result.data;
    },

    async writeViewSettings(payload: { viewSettings: ViewSettings }) {
      const result = await new SaveSettingAction().saveViewSettings(payload.viewSettings);

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.viewSettings = result.data;
    },

    async readTestScriptOption() {
      const result = await new ReadSettingAction().readTestScriptOption();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    async writeTestScriptOption(payload: { option: Pick<TestScriptOption, "buttonDefinitions"> }) {
      const result = await new SaveSettingAction().saveTestScriptOption(payload.option);

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }
    },

    /**
     * Load Device Settings.
     * @param context Action context.
     */
    async readDeviceSettings() {
      const result = await new ReadDeviceSettingAction().readDeviceSettings();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.deviceSettings = result.data.config;
    },

    /**
     * Save Device Settings.
     * @param context Action context.
     * @param payload.config Capture config.
     */
    async writeDeviceSettings(payload: { config: Partial<DeviceSettings> }) {
      const deviceSettings: { config: DeviceSettings } = {
        config: {
          platformName: payload.config.platformName ?? this.deviceSettings.platformName,
          browser: payload.config.browser ?? this.deviceSettings.browser,
          device: payload.config.device ?? this.deviceSettings.device,
          platformVersion: payload.config.platformVersion ?? this.deviceSettings.platformName,
          waitTimeForStartupReload:
            payload.config.waitTimeForStartupReload ?? this.deviceSettings.waitTimeForStartupReload
        }
      };

      const result = await new SaveDeviceSettingAction().saveDeviceSettings(deviceSettings);

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.deviceSettings = result.data.config;
    },

    /**
     * Export Project Settings.
     * @param context Action context.
     */
    async exportProjectSettings() {
      if (!this.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new ExportConfigAction(this.repositoryService).exportSettings();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    }
  }
});

function getRepositoryUrlsFromLocalStorage(): string[] {
  const repositoryUrlsStr = localStorage.getItem("latteart-config-remoteRepositoryUrls") ?? "[]";
  return JSON.parse(repositoryUrlsStr);
}

function setRepositoryUrlsToLocalStorage(urls: string[]) {
  localStorage.setItem("latteart-config-remoteRepositoryUrls", JSON.stringify(urls));
}
