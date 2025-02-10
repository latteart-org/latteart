/**
 * Copyright 2024 NTT Corporation.
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

import { RepositoryDataLoader, type DataLoader } from "@/lib/common/dataLoader";
import type { I18nProvider } from "@/lib/common/internationalization";
import {
  readAutofillSetting,
  readAutoOperationSetting,
  readCaptureMediaSettings,
  readCaptureWindowSize,
  readDeviceSettings,
  readLocale,
  readTestHintSetting,
  readTestScriptOption,
  saveAutofillSetting,
  saveAutoOperationSetting,
  saveCaptureMediaSettings,
  saveCaptureWindowSize,
  saveDeviceSettings,
  saveLocale,
  saveTestHintSetting,
  saveTestScriptOption
} from "@/lib/common/settings/userSettings";
import { saveProjectSettings } from "@/lib/common/settings/projectSettings";
import type {
  CaptureMediaSetting,
  DeviceSettings,
  ProjectSettings,
  UserSettings
} from "@/lib/common/settings/Settings";
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
import { LocalStorageSettingRepository } from "@/lib/common/LocalStorageSettingRepository";

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
   * User settings.
   */
  userSettings: UserSettings;

  progressDialog: {
    opened: boolean;
    message?: string;
  };

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
        screenDefinition: {
          screenDefType: "title",
          conditionGroups: []
        },
        coverage: {
          include: {
            tags: []
          }
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
    userSettings: {
      autofillSetting: new LocalStorageSettingRepository().getAutofillSetting(),
      autoOperationSetting: new LocalStorageSettingRepository().getAutoOperationSetting(),
      captureMediaSetting: new LocalStorageSettingRepository().getCaptureMediaSetting(),
      captureWindowSize: new LocalStorageSettingRepository().getCaptureWindowSize(),
      testHintSetting: new LocalStorageSettingRepository().getTestHintSetting(),
      deviceSettings: new LocalStorageSettingRepository().getDeviceSettings(),
      testScriptOption: new LocalStorageSettingRepository().getTestScriptOption(),
      repositoryUrls: getRepositoryUrlsFromLocalStorage()
    },
    progressDialog: {
      opened: false,
      message: ""
    },
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
      const oldUrls = this.userSettings.repositoryUrls;

      if (!oldUrls.includes(payload.url)) {
        const newUrls = [...oldUrls, payload.url];
        setRepositoryUrlsToLocalStorage(newUrls);

        this.userSettings.repositoryUrls = [...newUrls];
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
      const result = await readLocale();

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
      const saveLocaleActionResult = await saveLocale(payload.locale);

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

        throw new Error(this.message("error.common.connect_remote_url_failed"));
      }

      this.setRepositoryServiceUrl({ url: serverUrl });

      if (this.repositoryService) {
        this.dataLoader = new RepositoryDataLoader(this.repositoryService);
      }

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

      const result = await saveProjectSettings(settings, this.repositoryService);

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.setProjectSettings({ settings: result.data });
    },

    async writeConfig(payload: { config: Partial<ProjectSettings["config"]> }) {
      const settings: Partial<ProjectSettings> = {
        config: {
          screenDefinition:
            payload.config.screenDefinition ?? this.projectSettings.config.screenDefinition,
          coverage: payload.config.coverage ?? this.projectSettings.config.coverage,
          testResultComparison:
            payload.config.testResultComparison ?? this.projectSettings.config.testResultComparison,
          experimentalFeatureSetting:
            payload.config.experimentalFeatureSetting ??
            this.projectSettings.config.experimentalFeatureSetting
        }
      };

      await this.writeProjectSettings({ settings });
    },

    writeUserSettings(payload: { userSettings: Partial<UserSettings & { locale?: "ja" | "en" }> }) {
      if (payload.userSettings.autoOperationSetting) {
        const result = saveAutoOperationSetting(payload.userSettings.autoOperationSetting);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.autoOperationSetting = {
          ...payload.userSettings.autoOperationSetting
        };
      }
      if (payload.userSettings.autofillSetting) {
        const result = saveAutofillSetting(payload.userSettings.autofillSetting);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.autofillSetting = {
          ...payload.userSettings.autofillSetting
        };
      }
      if (payload.userSettings.captureMediaSetting) {
        const result = saveCaptureMediaSettings(payload.userSettings.captureMediaSetting);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.captureMediaSetting = {
          ...payload.userSettings.captureMediaSetting
        };
      }
      if (payload.userSettings.captureWindowSize) {
        const result = saveCaptureWindowSize(payload.userSettings.captureWindowSize);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.captureWindowSize = {
          ...payload.userSettings.captureWindowSize
        };
      }

      if (payload.userSettings.testHintSetting) {
        const result = saveTestHintSetting(payload.userSettings.testHintSetting);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.testHintSetting = {
          ...payload.userSettings.testHintSetting
        };
      }

      if (payload.userSettings.deviceSettings) {
        const result = saveDeviceSettings(payload.userSettings.deviceSettings);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.deviceSettings = {
          ...payload.userSettings.deviceSettings
        };
      }

      if (payload.userSettings.testScriptOption) {
        const result = saveTestScriptOption(payload.userSettings.testScriptOption);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.testScriptOption = {
          ...payload.userSettings.testScriptOption
        };
      }

      if (payload.userSettings.captureWindowSize) {
        console.log(payload.userSettings.captureWindowSize);
        const result = saveCaptureWindowSize(payload.userSettings.captureWindowSize);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.userSettings.captureWindowSize = {
          ...payload.userSettings.captureWindowSize
        };
      }

      if (payload.userSettings.repositoryUrls) {
        setRepositoryUrlsToLocalStorage(payload.userSettings.repositoryUrls);
        this.userSettings.repositoryUrls = [...payload.userSettings.repositoryUrls];
      }

      if (payload.userSettings.locale) {
        const result = saveLocale(payload.userSettings.locale);
        if (result.isFailure()) {
          throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
        }
        this.i18nProvider?.setLocale(payload.userSettings.locale);
      }
      return;
    },

    readUserSettings() {
      const readAutofillSettingResult = readAutofillSetting();
      if (readAutofillSettingResult.isFailure()) {
        throw new Error(
          this.message(
            readAutofillSettingResult.error.messageKey,
            readAutofillSettingResult.error.variables ?? {}
          )
        );
      }

      const readAutoOperationSettingResult = readAutoOperationSetting();
      if (readAutoOperationSettingResult.isFailure()) {
        throw new Error(
          this.message(
            readAutoOperationSettingResult.error.messageKey,
            readAutoOperationSettingResult.error.variables ?? {}
          )
        );
      }

      const captureMediaSettingResult = readCaptureMediaSettings();
      if (captureMediaSettingResult.isFailure()) {
        throw new Error(
          this.message(
            captureMediaSettingResult.error.messageKey,
            captureMediaSettingResult.error.variables ?? {}
          )
        );
      }

      const captureWindowSizeResult = readCaptureWindowSize();
      if (captureWindowSizeResult.isFailure()) {
        throw new Error(
          this.message(
            captureWindowSizeResult.error.messageKey,
            captureWindowSizeResult.error.variables ?? {}
          )
        );
      }

      const testHintSettingResult = readTestHintSetting();
      if (testHintSettingResult.isFailure()) {
        throw new Error(
          this.message(
            testHintSettingResult.error.messageKey,
            testHintSettingResult.error.variables ?? {}
          )
        );
      }

      const deviceSettingResult = readDeviceSettings();
      if (deviceSettingResult.isFailure()) {
        throw new Error(
          this.message(
            deviceSettingResult.error.messageKey,
            deviceSettingResult.error.variables ?? {}
          )
        );
      }

      const testScriptOptionResult = readTestScriptOption();
      if (testScriptOptionResult.isFailure()) {
        throw new Error(
          this.message(
            testScriptOptionResult.error.messageKey,
            testScriptOptionResult.error.variables ?? {}
          )
        );
      }

      const localeResult = readLocale();
      if (localeResult.isFailure()) {
        throw new Error(
          this.message(localeResult.error.messageKey, localeResult.error.variables ?? {})
        );
      }

      this.userSettings = {
        autofillSetting: readAutofillSettingResult.data,
        autoOperationSetting: readAutoOperationSettingResult.data,
        captureMediaSetting: captureMediaSettingResult.data,
        captureWindowSize: captureWindowSizeResult.data,
        testHintSetting: testHintSettingResult.data,
        deviceSettings: deviceSettingResult.data,
        testScriptOption: testScriptOptionResult.data,
        repositoryUrls: getRepositoryUrlsFromLocalStorage()
      };
    },

    readTestScriptOption() {
      const result = readTestScriptOption();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    async writeTestScriptOption(payload: { option: Pick<TestScriptOption, "buttonDefinitions"> }) {
      const result = saveTestScriptOption(payload.option);

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.userSettings.testScriptOption = { ...result.data };
    },

    /**
     * Load Device Settings.
     * @param context Action context.
     */
    readDeviceSettings() {
      const result = readDeviceSettings();

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.userSettings.deviceSettings = result.data;
    },

    /**
     * Save Device Settings.
     * @param context Action context.
     * @param payload.config Capture config.
     */
    async writeDeviceSettings(payload: { deviceSettings: Partial<DeviceSettings> }) {
      const deviceSettings: DeviceSettings = {
        platformName:
          payload.deviceSettings.platformName ?? this.userSettings.deviceSettings.platformName,
        browser: payload.deviceSettings.browser ?? this.userSettings.deviceSettings.browser,
        device: payload.deviceSettings.device ?? this.userSettings.deviceSettings.device,
        platformVersion:
          payload.deviceSettings.platformVersion ?? this.userSettings.deviceSettings.platformName,
        waitTimeForStartupReload:
          payload.deviceSettings.waitTimeForStartupReload ??
          this.userSettings.deviceSettings.waitTimeForStartupReload
      };

      const result = await saveDeviceSettings(deviceSettings);

      if (result.isFailure()) {
        throw new Error(this.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.userSettings.deviceSettings = result.data;
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
    },
    writeCaptureMediaSettings(payload: { captureMediaSetting: Partial<CaptureMediaSetting> }) {
      const result = readCaptureMediaSettings();
      if (result.isFailure()) {
        throw new Error(result.error.messageKey);
      }
      const settings = {
        ...this.userSettings.captureMediaSetting,
        ...payload.captureMediaSetting
      };
      this.userSettings.captureMediaSetting = settings;
      saveCaptureMediaSettings(settings);
    },

    readCaptureMediaSettings(): CaptureMediaSetting {
      const result = readCaptureMediaSettings();
      if (result.isFailure()) {
        throw new Error(result.error.messageKey);
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
