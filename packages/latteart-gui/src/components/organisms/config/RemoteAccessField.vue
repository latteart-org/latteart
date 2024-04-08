<!--
 Copyright 2023 NTT Corporation.

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
        :hide-details="hideDetails"
        v-model="targetUrl"
        :items="urls"
        :label="store.getters.message('remote-access.remote-connection-url')"
        id="connectUrlTextField"
        ref="urlField"
        :disabled="isCapturing || isReplaying"
        :style="{ 'padding-top': '10px' }"
      ></v-combobox>
    </v-col>
    <v-col cols="auto">
      <v-btn
        :color="color"
        id="connecttButton"
        @click="connect()"
        :disabled="isCapturing || isReplaying || targetUrl === url"
        class="ma-2"
        >{{ store.getters.message("remote-access.connect") }}</v-btn
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
import { useStore } from "@/store";
import { CaptureControlState } from "@/store/captureControl";

export default defineComponent({
  props: {
    color: { type: String, default: "", required: true },
    hideDetails: { type: Boolean, default: false, required: true }
  },
  components: {
    "error-message-dialog": ErrorMessageDialog,
    "information-message-dialog": InformationMessageDialog
  },
  setup() {
    const store = useStore();
    const urlField = ref(null);

    const informationMessageDialogOpened = ref(false);
    const informationTitle = ref("");
    const informationMessage = ref("");
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");
    const remoteUrl = ref("");

    const urls = computed((): string[] => {
      const localUrl = store.state.repositoryService.serviceUrl;
      const remoteUrls = store.state.repositoryUrls;
      return [localUrl, ...remoteUrls];
    });

    const url = computed((): string => {
      return store.state.repositoryService.serviceUrl;
    });

    const targetUrl = ref(url.value);

    const isCapturing = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState).isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return ((store.state as any).captureControl as CaptureControlState).isReplaying;
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
      await store.dispatch("loadLocaleFromSettings");
      await store.dispatch("readSettings");
      await store.dispatch("readViewSettings");
      await store.dispatch("operationHistory/clearTestResult");
      store.commit("operationHistory/clearStoringTestResultInfos");
      store.commit("operationHistory/clearScreenTransitionDiagramGraph");
      store.commit("operationHistory/clearElementCoverages");
      store.commit("operationHistory/clearInputValueTable");
      await store.dispatch("captureControl/resetTimer");
      await store.dispatch("testManagement/readProject");
    };

    const startRemoteConnection = (targetUrl: string) => {
      (async () => {
        store.dispatch("openProgressDialog", {
          message: store.getters.message("remote-access.connecting-remote-url")
        });

        try {
          const url = await store.dispatch("connectRepository", {
            targetUrl
          });

          await initialize();

          informationMessageDialogOpened.value = true;
          informationTitle.value = store.getters.message("common.confirm");
          informationMessage.value = store.getters.message(
            "remote-access.connect-remote-url-succeeded",
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
          store.dispatch("closeProgressDialog");
        }
      })();
    };

    watch(url, updateUrl);

    return {
      store,
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
