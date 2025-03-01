<!--
 Copyright 2025 NTT Corporation.

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
  <v-app>
    <v-navigation-drawer :rail="mini" permanent @click="mini = false">
      <v-list-item prepend-avatar="@/assets/logo.png" class="pa-2">
        <v-list-item-title class="text-h6"> LatteArt </v-list-item-title>
        <v-list-subtitle
          class="text-caption font-weight-black text-medium-emphasis"
          :title="fullVersion"
        >
          {{ version }}
        </v-list-subtitle>

        <template #append>
          <v-btn variant="flat" icon="chevron_left" @click.stop="mini = !mini"></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-subheader v-if="!mini">{{ $t("root-page.capture") }}</v-list-subheader>

        <v-list-item
          :disabled="isCapturing || isReplaying"
          to="/page/start"
          :title.attr="$t('common.start-capture-window-title')"
          exact
          prepend-icon="video_call"
        >
          <v-list-item-title>{{ $t("common.start-capture-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="currentTestResultName && !recentReviewQuery"
          to="/test-result"
          :title.attr="currentTestResultName"
          exact
        >
          <template #prepend>
            <v-badge v-if="isCapturing" color="red" dot><v-icon>devices</v-icon></v-badge>
            <v-icon v-else>devices</v-icon>
          </template>

          <v-list-item-title>{{ currentTestResultName }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="isCapturing || isReplaying"
          to="/page/test-result-list"
          :title.attr="$t('common.test-result-list-window-title')"
          exact
          prepend-icon="folder_open"
        >
          <v-list-item-title>{{ $t("common.test-result-list-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-subheader v-if="!mini">{{ $t("root-page.test-design-support") }}</v-list-subheader>

        <v-list-item
          :disabled="isReplaying || isRunning"
          to="/page/test-hint-list"
          :title.attr="$t('common.test-hint-list-window-title')"
          exact
          prepend-icon="live_help"
        >
          <v-list-item-title>{{ $t("common.test-hint-list-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-subheader v-if="!mini">{{ $t("common.management") }}</v-list-subheader>

        <v-list-item
          :disabled="!hasTestMatrix || isReplaying || isRunning"
          to="/page/test-matrix"
          :title.attr="$t('common.test-matrix-window-title')"
          exact
          prepend-icon="calendar_today"
        >
          <v-list-item-title>{{ $t("common.test-matrix-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="isCapturing || isReplaying"
          to="/page/test-matrix-edit"
          :title.attr="$t('common.test-matrix-edit-window-title')"
          exact
          prepend-icon="edit"
        >
          <v-list-item-title>{{ $t("common.test-matrix-edit-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="!hasTestMatrix || isCapturing || isReplaying"
          to="/page/stories-review"
          :title.attr="$t('common.stories-review-window-title')"
          exact
          prepend-icon="library_books"
        >
          <v-list-item-title>{{ $t("common.stories-review-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="!hasSession || isCapturing || isReplaying"
          to="/page/progress-management"
          :title.attr="$t('common.progress-management-window-title')"
          exact
          prepend-icon="waterfall_chart"
        >
          <v-list-item-title>{{ $t("common.progress-management-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="!hasSession || isCapturing || isReplaying"
          to="/page/quality-management"
          :title.attr="$t('common.quality-management-window-title')"
          exact
          prepend-icon="show_chart"
        >
          <v-list-item-title>{{ $t("common.quality-management-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          :disabled="isCapturing || isReplaying"
          to="/page/optional-features"
          :title.attr="$t('common.optional-features-window-title')"
          exact
          prepend-icon="apps"
        >
          <v-list-item-title>{{ $t("common.optional-features-window-title") }}</v-list-item-title>
        </v-list-item>

        <v-divider v-if="recentStories.length > 0"></v-divider>

        <div v-if="recentStories.length > 0">
          <v-list-subheader v-if="!mini">{{ $t("common.recent-stories") }}</v-list-subheader>

          <v-list-item
            :disabled="isReplaying || isRunning"
            v-for="story in recentStories"
            :key="story.id"
            :to="story.path"
            :title.attr="`${truncateName(story.testMatrixName)} ${truncateName(story.groupName)} ${truncateName(story.testTargetName)} ${truncateName(story.viewPointName)}`"
            exact
            prepend-icon="assignment"
          >
            <v-list-item-title>{{ story.testTargetName }}</v-list-item-title>
            <v-list-item-subtitle v-if="!mini">{{ story.viewPointName }}</v-list-item-subtitle>
          </v-list-item>
        </div>

        <v-divider v-if="currentTestResultName && recentReviewQuery"></v-divider>

        <div v-if="currentTestResultName && recentReviewQuery">
          <v-list-subheader v-if="!mini">{{ $t("common.current-review") }}</v-list-subheader>

          <v-list-item
            :to="{ path: '/review', query: recentReviewQuery }"
            :title.attr="currentTestResultName"
            exact
            prepend-icon="pageview"
          >
            <v-list-item-title>{{ currentTestResultName }}</v-list-item-title>
          </v-list-item>
        </div>

        <v-divider></v-divider>

        <v-list-subheader v-if="!mini">{{ $t("common.other") }}</v-list-subheader>

        <v-list-item
          :disabled="isReplaying || isRunning"
          to="/page/config"
          :title.attr="$t('common.config-window-title')"
          exact
          prepend-icon="settings"
        >
          <v-list-item-title>{{ $t("common.config-window-title") }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <extension-global-contents />
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <progress-dialog></progress-dialog>
    <autofill-register-dialog />
    <error-message-dialog
      :opened="errorMessageDialogOpened"
      :message="errorMessage"
      @close="errorMessageDialogOpened = false"
    />
  </v-app>
</template>

<script lang="ts">
import packageJson from "../../../package.json";
import { extensions } from "@/extensions";
import ErrorMessageDialog from "@/components/molecules/ErrorMessageDialog.vue";
import ProgressDialog from "@/components/organisms/dialog/ProgressDialog.vue";
import { type TestMatrix } from "@/lib/testManagement/types";
import AutofillRegisterDialog from "@/components/organisms/dialog/AutofillRegisterDialog.vue";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";
import { useOperationHistoryStore } from "@/stores/operationHistory";
import { useTestManagementStore } from "@/stores/testManagement";
import ExtensionGlobalContents from "../organisms/extensions/ExtensionGlobalContents.vue";
import TextUtil from "@/lib/operationHistory/graphConverter/TextUtil";

export default defineComponent({
  components: {
    "progress-dialog": ProgressDialog,
    "error-message-dialog": ErrorMessageDialog,
    "autofill-register-dialog": AutofillRegisterDialog,
    "extension-global-contents": ExtensionGlobalContents
  },
  setup() {
    const rootStore = useRootStore();
    const captureControlStore = useCaptureControlStore();
    const operationHistoryStore = useOperationHistoryStore();
    const testManagementStore = useTestManagementStore();
    const router = useRouter();

    const mini = ref(false);
    const displayedPage = ref(0);
    const errorMessageDialogOpened = ref(false);
    const errorMessage = ref("");

    const version = `v${packageJson.version}${extensions.length > 0 ? ` + ext` : ""}`;
    const fullVersion = [
      `${packageJson.name} ${packageJson.version}`,
      ...extensions.map(({ name, version }) => `  + ${name ?? "unknown"} ${version ?? ""}`)
    ].join("\n");

    onMounted(() => {
      (async () => {
        try {
          await rootStore.loadLocaleFromSettings();
          await rootStore.readSettings();
          rootStore.readUserSettings();
          await rootStore.readDeviceSettings();
        } catch (error) {
          if (error instanceof Error) {
            errorMessage.value = error.message;
            errorMessageDialogOpened.value = true;
          } else {
            throw error;
          }
        }

        router.push({ path: "/page/start" });
      })();
    });

    const recentStories = computed(() => {
      return testManagementStore.recentStories.flatMap((story) => {
        const testMatrix: TestMatrix | undefined = testManagementStore.findTestMatrix(
          story.testMatrixId
        );

        if (!testMatrix) {
          return [];
        }

        const group = testMatrix.groups.find((group) =>
          group.testTargets.some((testTarget) => story.testTargetId === testTarget.id)
        );

        if (!group) {
          return [];
        }

        const testTarget = group.testTargets.find(
          (testTarget) => story.testTargetId === testTarget.id
        );

        if (!testTarget) {
          return [];
        }

        const viewPoint = testMatrix.viewPoints.find((viewPoint) => {
          return viewPoint.id === story.viewPointId;
        });

        if (!viewPoint) {
          return [];
        }

        return {
          id: story.id,
          path: `/page/story/${story.id}`,
          testTargetName: testTarget.name,
          viewPointName: viewPoint.name,
          testMatrixName: testMatrix.name,
          groupName: group.name
        };
      });
    });

    const currentTestResultName = computed(() => {
      return operationHistoryStore.testResultInfo.name;
    });

    const recentReviewQuery = computed(() => {
      return testManagementStore.recentReviewQuery;
    });

    const isCapturing = computed(() => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed(() => {
      return captureControlStore.isReplaying;
    });

    const isRunning = computed((): boolean => {
      return captureControlStore.isRunning;
    });

    const hasTestMatrix = computed((): boolean => {
      const testMatrices: TestMatrix[] = testManagementStore.getTestMatrices();

      return testMatrices.length > 0;
    });

    const hasSession = computed((): boolean => {
      const stories = testManagementStore.stories;

      return stories.flatMap((story) => story.sessions).length > 0;
    });

    const isWindowSelectorDialogOpened = computed((): boolean => {
      return captureControlStore.isWindowSelectorDialogOpened;
    });

    const isAutofillRegisterDialogDataChange = computed((): boolean => {
      const isReviewing = recentReviewQuery.value !== null;
      const result = !!captureControlStore.autofillRegisterDialogData;
      return result && !isReviewing;
    });

    const isAutofillConditionGroupsChanged = computed((): boolean => {
      const data = captureControlStore.autofillSelectDialogData;
      const result = !!data?.autofillConditionGroups;
      return result;
    });

    const isCompletionDialogDataChanged = computed((): boolean => {
      const result = !!captureControlStore.completionDialogData;
      return result;
    });

    const toHistoryView = async (newState: boolean) => {
      if (!newState) {
        return;
      }
      const targetPath = "/test-result";
      if (router.currentRoute.value.path !== targetPath) {
        await router.push({ path: targetPath });
      }
    };

    const truncateName = (text: string) => {
      return TextUtil.truncate(text, 100);
    };

    watch(isWindowSelectorDialogOpened, toHistoryView);
    watch(isAutofillRegisterDialogDataChange, toHistoryView);
    watch(isAutofillConditionGroupsChanged, toHistoryView);
    watch(isCompletionDialogDataChanged, toHistoryView);

    return {
      mini,
      displayedPage,
      errorMessageDialogOpened,
      errorMessage,
      recentStories,
      currentTestResultName,
      recentReviewQuery,
      isCapturing,
      isReplaying,
      isRunning,
      hasTestMatrix,
      hasSession,
      version,
      fullVersion,
      truncateName
    };
  }
});
</script>

<style scoped>
:deep(.v-avatar.v-avatar--size-default) {
  --v-avatar-height: 40px !important
;
}
</style>
