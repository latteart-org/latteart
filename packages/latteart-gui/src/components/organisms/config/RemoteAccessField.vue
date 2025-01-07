<!--
 Copyright 2024 NTT Corporation.

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
  <v-row>
    <v-col>
      <v-combobox
        id="connectUrlTextField"
        ref="urlField"
        v-model="targetUrl"
        variant="underlined"
        :hide-details="hideDetails"
        :items="urls"
        :label="$t('remote-access-field.remote-connection-url')"
        :disabled="isCapturing || isReplaying"
        :style="{ 'padding-top': '10px' }"
      ></v-combobox>
    </v-col>
    <v-col cols="auto">
      <v-btn
        id="connecttButton"
        :color="color"
        :disabled="isCapturing || isReplaying || targetUrl === url"
        class="ma-2"
        @click="connect()"
        >{{ $t("remote-access-field.connect") }}</v-btn
      >
    </v-col>
    <information-message-dialog
      :opened="informationMessageDialogOpened"
      :title="informationTitle"
      :message="informationMessage"
      @close="informationMessageDialogOpened = false"
    />

    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-row>
</template>

<script lang="ts">
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import InformationMessageDialog from "@/components/molecules/InformationMessageDialog.vue";
import { computed, defineComponent, ref, nextTick, watch } from "vue";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useTestManagementStore } from "@/stores/testManagement";

export default defineComponent({
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog
  },
  props: {
    color: { type: String, default: "", required: true },
    hideDetails: { type: Boolean, default: false, required: true }
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();
    const testManagementStore = useTestManagementStore();

    const urlField = ref(null);

    const informationMessageDialogOpened = ref(false);
    const informationTitle = ref("");
    const informationMessage = ref("");
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");
    const remoteUrl = ref("");

    const urls = computed((): string[] => {
      const localUrl = rootStore.repositoryService?.serviceUrl as string;
      const remoteUrls = rootStore.userSettings.repositoryUrls;
      return [...new Set([localUrl, ...remoteUrls])];
    });

    const url = computed((): string => {
      return rootStore.repositoryService?.serviceUrl as string;
    });

    const targetUrl = ref(url.value);

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const updateUrl = () => {
      targetUrl.value = url.value;
    };

    const connect = (): void => {
      (urlField.value as any).blur();
      nextTick(() => {
        if (targetUrl.value) {
          startRemoteConnection(targetUrl.value);
        } else {
          console.warn("Target URL is empty.");
        }
      });
    };

    const initialize = async (): Promise<void> => {
      await rootStore.loadLocaleFromSettings();
      await rootStore.readSettings();
      rootStore.readUserSettings();
      operationHistoryStore.clearTestResult();
      operationHistoryStore.storingTestResultInfos = [];
      operationHistoryStore.clearScreenTransitionDiagramGraph();
      operationHistoryStore.clearElementCoverages();
      operationHistoryStore.clearInputValueTable();
      captureControlStore.resetTimer();
      await testManagementStore.readProject();
    };

    const startRemoteConnection = (targetUrl: string) => {
      (async () => {
        rootStore.openProgressDialog({
          message: rootStore.message("remote-access-field.connecting-remote-url")
        });

        try {
          const url = await rootStore.connectRepository({
            targetUrl
          });

          await initialize();

          informationMessageDialogOpened.value = true;
          informationTitle.value = rootStore.message("common.confirm");
          informationMessage.value = rootStore.message(
            "remote-access-field.connect-remote-url-succeeded",
            {
              url
            }
          );
          remoteUrl.value = url;
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        } finally {
          rootStore.closeProgressDialog();
        }
      })();
    };

    watch(url, updateUrl);

    return {
      urlField,
      informationMessageDialogOpened,
      informationTitle,
      informationMessage,
      errorMessageDialogOpened,
      errorMessage,
      urls,
      url,
      targetUrl,
      isCapturing,
      isReplaying,
      connect
    };
  }
});
</script>
