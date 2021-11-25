<!--
 Copyright 2021 NTT Corporation.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <error-message-dialog
    :opened="errorMessageDialogOpened"
    :message="errorMessage"
    @close="errorMessageDialogOpened = false"
  />
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { CaptureConfig } from "./lib/captureControl/CaptureConfig";
import { OperationHistoryState } from "@/store/operationHistory/index";
import ErrorMessageDialog from "@/vue/pages/common/ErrorMessageDialog.vue";

@Component({
  components: {
    "error-message-dialog": ErrorMessageDialog,
  },
})
export default class ConfigLoader extends Vue {
  private readConfigComplete = false;
  private errorMessageDialogOpened = false;
  private errorMessage = "";

  private get config(): OperationHistoryState["config"] {
    return this.$store.getters["operationHistory/getConfig"]();
  }

  private get deviceConfig(): CaptureConfig {
    return this.$store.getters["captureControl/getDeviceConfig"]();
  }

  @Watch("config")
  private saveConfig(newConfig: OperationHistoryState["config"]) {
    if (this.readConfigComplete) {
      this.saveSettings(newConfig);
    }
  }

  @Watch("deviceConfig")
  private saveDeviceConfig(newConfig: CaptureConfig) {
    if (this.readConfigComplete) {
      this.saveDeviceSettings(newConfig);
    }
  }

  private mounted() {
    this.loadInitialLocale();
    this.loadSettings();
    this.loadDeviceSettings();
    this.$nextTick(() => {
      this.readConfigComplete = true;
    });
  }

  private saveSettings(config: OperationHistoryState["config"]): void {
    (async () => {
      try {
        await this.$store.dispatch("operationHistory/writeSettings", {
          config,
        });
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private saveDeviceSettings(config: CaptureConfig): void {
    (async () => {
      try {
        await this.$store.dispatch("captureControl/writeDeviceSettings", {
          config,
        });
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private loadInitialLocale(): void {
    if ((this as any).$settings) {
      return;
    }
    (async () => {
      try {
        // Use the settings passed in the argument when in viewer mode only.
        const settings = (this as any).$settings;
        await this.$store.dispatch("loadLocaleFromSettings", { settings });
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private loadSettings(): void {
    (async () => {
      try {
        // Use the settings passed in the argument when in viewer mode only.
        const settings = (this as any).$settings;
        await this.$store.dispatch("operationHistory/readSettings", {
          settings,
        });
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      }
    })();
  }

  private loadDeviceSettings(): void {
    if ((this as any).$settings) {
      return;
    }

    (async () => {
      try {
        await this.$store.dispatch("captureControl/readDeviceSettings");
      } catch (error) {
        this.errorMessage = error.message;
        this.errorMessageDialogOpened = true;
      }
    })();
  }
}
</script>
