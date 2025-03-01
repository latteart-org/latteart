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
  <v-container fluid class="fill-height pa-8">
    <v-container fluid class="align-self-start pa-0">
      <v-row v-if="story">
        <v-col cols="3">
          <v-text-field
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.test-matrix')"
            :model-value="testMatrixName"
          ></v-text-field>
          <v-text-field
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.group')"
            :model-value="groupName"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.test-target')"
            :model-value="testTargetName"
          ></v-text-field>
          <v-text-field
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.viewpoint')"
            :model-value="viewPointName"
          ></v-text-field>
          <v-select
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            :items="statuses"
            item-title="text"
            item-value="value"
            :model-value="story.status"
            :label="$t('story-page.status')"
            :readonly="isViewerMode"
            :menu-icon="isViewerMode ? '' : '$dropdown'"
            @update:model-value="updateStatus"
          >
          </v-select>
        </v-col>
        <v-col cols="3">
          <v-text-field
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.planned-sessions')"
            :model-value="countPlannedSessions()"
          ></v-text-field>
          <v-text-field
            v-model="doneSessionNum"
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.completed-sessions')"
          ></v-text-field>
          <v-text-field
            v-model="extractionBugNum"
            :variant="isViewerMode ? 'solo' : 'underlined'"
            class="pt-0"
            readonly
            :label="$t('common.bug-count')"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <review-button
            :disabled="!canReviewSession"
            :story="story"
            :session-ids="reviewTargetSessionIds"
          ></review-button>

          <v-select
            v-model="reviewTargetSessionIds"
            variant="underlined"
            :disabled="isCapturing || isReplaying"
            :items="reviewableSessions"
            :label="$t('story-page.review-target')"
            item-title="displayName"
            item-value="id"
            :multiple="!isViewerMode"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-expansion-panels v-model="sessionPanelExpantionStates" class="py-0 mb-2" multiple>
            <v-expansion-panel
              v-for="(session, index) in story?.sessions"
              :key="session.id"
              class="py-0"
            >
              <v-expansion-panel-title class="py-0">
                <v-row>
                  <v-col class="d-flex align-center">
                    <div>
                      {{ `${$t("story-page.session")} ${index + 1}` }}
                    </div>
                  </v-col>
                  <v-col class="d-flex align-center">
                    <div @click="$event.stopPropagation()">
                      <v-checkbox
                        :id="`completedSessionCheckBox${index}`"
                        :model-value="session.isDone"
                        :label="$t('story-page.session-complete')"
                        :readonly="isViewerMode"
                        :ripple="!isViewerMode"
                        hide-details
                        @update:model-value="
                          (value) => changeSessionStatus(session.id, value ?? false)
                        "
                      ></v-checkbox>
                    </div>
                  </v-col>
                  <v-col class="d-flex align-center">
                    <v-btn
                      v-if="!isViewerMode"
                      :disabled="isCapturing || isReplaying"
                      size="small"
                      block
                      @click="
                        $event.stopPropagation();
                        openConfirmDialogToDeleteSession(session.id);
                      "
                      >{{ $t("common.delete") }}</v-btn
                    >
                  </v-col>
                </v-row>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <session-info :story-id="story?.id" :session-id="session.id"></session-info>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            v-if="!isViewerMode"
            id="addSessionButton"
            :disabled="isCapturing || isReplaying"
            @click="addNewSession"
            >{{ $t("story-page.add-session") }}</v-btn
          >
        </v-col>
      </v-row>
    </v-container>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :on-accept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import type {
  Plan,
  TestMatrix,
  TestTarget,
  ViewPoint,
  Story,
  Session
} from "@/lib/testManagement/types";
import { CHARTER_STATUS } from "@/lib/testManagement/Enum";
import ReviewButton from "@/components/organisms/story/ReviewButton.vue";
import ConfirmDialog from "@/components/molecules/ConfirmDialog.vue";
import SessionInfo from "@/components/organisms/story/SessionInfo.vue";
import { computed, defineComponent, onBeforeUnmount, ref, inject } from "vue";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import { useCaptureControlStore } from "@/stores/captureControl";

export default defineComponent({
  components: {
    "session-info": SessionInfo,
    "review-button": ReviewButton,
    "confirm-dialog": ConfirmDialog
  },
  setup() {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const captureControlStore = useCaptureControlStore();
    const route = useRoute();

    const isViewerMode: boolean = inject("isViewerMode") ?? false;

    const confirmDialogOpened = ref(false);
    const confirmDialogTitle = ref("");
    const confirmDialogMessage = ref("");
    const confirmDialogAccept = ref(() => {
      /* Do nothing */
    });

    const reviewTargetSessionIds = ref([]);

    const sessionPanelExpantionStates = ref<number[]>([]);

    const storyId = computed((): string => {
      const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
      return id;
    });

    const story = computed((): Story | undefined => {
      return testManagementStore.findStory(storyId.value);
    });

    const reviewableSessions = computed(
      (): {
        id: string | undefined;
        displayName: string;
      }[] => {
        reviewTargetSessionIds.value = [];
        if (!story.value) {
          return [];
        }

        const reviewableSessions: Session[] = testManagementStore.collectReviewableSessions(
          story.value.id
        );

        return reviewableSessions.map((session) => {
          const sessionNameSuffix =
            story.value?.sessions.findIndex(({ id }) => id === session.id) ?? -1;

          const testResultName = session.testResultFiles.map((result) => result.name).join(", ");

          return {
            id: session.id,
            displayName: `${rootStore.message("story-page.session")}${
              sessionNameSuffix + 1
            }${testResultName ? ` (${testResultName})` : ""}`
          };
        });
      }
    );

    const testMatrixName = computed((): string => {
      if (!testMatrix.value) {
        return "";
      }
      return testMatrix.value.name;
    });

    const groupName = computed((): string => {
      if (!testMatrix.value) {
        return "";
      }

      const targetGroup = testMatrix.value.groups.find((group) => {
        return group.testTargets.some((target) => target.id === testTarget.value?.id);
      });

      if (!targetGroup) {
        return "";
      }

      return targetGroup.name;
    });

    const statuses = computed(() => {
      return [
        {
          text: rootStore.message(`common.status-${CHARTER_STATUS.OUT_OF_SCOPE.id}`),
          value: CHARTER_STATUS.OUT_OF_SCOPE.id
        },
        {
          text: rootStore.message(`common.status-${CHARTER_STATUS.OK.id}`),
          value: CHARTER_STATUS.OK.id
        },
        {
          text: rootStore.message(`common.status-${CHARTER_STATUS.NG.id}`),
          value: CHARTER_STATUS.NG.id
        },
        {
          text: rootStore.message(`common.status-${CHARTER_STATUS.ONGOING.id}`),
          value: CHARTER_STATUS.ONGOING.id
        },
        {
          text: rootStore.message(`common.status-${CHARTER_STATUS.PENDING.id}`),
          value: CHARTER_STATUS.PENDING.id
        }
      ];
    });

    const doneSessionNum = computed((): number => {
      return (
        story.value?.sessions.filter((session: Session) => {
          return session.isDone;
        }).length ?? 0
      );
    });

    const extractionBugNum = computed((): number => {
      return (
        story.value?.sessions.reduce((bugNum, currentSession) => {
          if (!currentSession.isDone) {
            return bugNum;
          }

          bugNum += currentSession.notes.filter((note) => (note.tags ?? []).includes("bug")).length;

          return bugNum;
        }, 0) ?? 0
      );
    });

    const testMatrix = computed((): TestMatrix | undefined => {
      return testManagementStore.findTestMatrix(story.value?.testMatrixId ?? "");
    });

    const testTarget = computed((): TestTarget | undefined => {
      return testMatrix.value?.groups
        .flatMap((group) => group.testTargets)
        .find((testTarget) => story.value?.testTargetId === testTarget.id);
    });

    const testTargetName = computed((): string => {
      if (!testTarget.value) {
        return "";
      }
      return testTarget.value.name;
    });

    const viewPoint = computed((): ViewPoint | undefined => {
      if (!testMatrix.value) {
        return undefined;
      }
      return testMatrix.value.viewPoints.find((viewPoint) => {
        return viewPoint.id === story.value?.viewPointId;
      });
    });

    const viewPointName = computed((): string => {
      if (!viewPoint.value) {
        return "";
      }
      return viewPoint.value.name;
    });

    const plan = computed((): Plan | undefined => {
      if (!testTarget.value) {
        return undefined;
      }
      return testTarget.value.plans.find((plan: Plan) => {
        return plan.viewPointId === story.value?.viewPointId;
      });
    });

    const canReviewSession = computed((): boolean => {
      if (isCapturing.value || isReplaying.value) {
        return false;
      }

      return reviewTargetSessionIds.value.length >= 1;
    });

    const isCapturing = computed((): boolean => {
      return captureControlStore.isCapturing;
    });

    const isReplaying = computed((): boolean => {
      return captureControlStore.isReplaying;
    });

    const countPlannedSessions = (): number => {
      if (!plan.value) {
        return 0;
      }
      return plan.value.value;
    };

    const updateStatus = (value: string) => {
      testManagementStore.updateStory({
        storyId: storyId.value,
        params: {
          status: value
        }
      });
    };

    const addNewSession = () => {
      testManagementStore.addNewSession({
        storyId: storyId.value
      });
    };

    const changeSessionStatus = (sessionId: string, isDone: boolean): void => {
      testManagementStore.updateSession({
        storyId: storyId.value,
        sessionId,
        params: { isDone }
      });
    };

    const openConfirmDialogToDeleteSession = (sessionId: string) => {
      confirmDialogTitle.value = rootStore.message("story-page.delete-session");
      confirmDialogMessage.value = rootStore.message("common.delete-warning");
      confirmDialogAccept.value = () => {
        testManagementStore.deleteSession({
          storyId: storyId.value,
          sessionId
        });
      };

      confirmDialogOpened.value = true;
    };

    const sessionPanelExpantionStatesKey = ref(
      `latteart-management-sessionPanelExpantionStates_${storyId.value}`
    );

    onBeforeUnmount(async () => {
      if (sessionPanelExpantionStates.value.length === 0) {
        localStorage.removeItem(sessionPanelExpantionStatesKey.value);
        return;
      }

      localStorage.setItem(
        sessionPanelExpantionStatesKey.value,
        JSON.stringify(sessionPanelExpantionStates.value)
      );
    });

    (async () => {
      if (!isViewerMode) {
        await testManagementStore.readStory({
          storyId: Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
        });
      }

      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      sessionPanelExpantionStates.value =
        JSON.parse(localStorage.getItem(sessionPanelExpantionStatesKey.value) as string) ??
        story.value?.sessions.map((_, index) => index) ??
        [];

      if (story.value) {
        testManagementStore.addRecentStory({
          story: story.value
        });
      }
    })();

    return {
      isViewerMode,
      confirmDialogOpened,
      confirmDialogTitle,
      confirmDialogMessage,
      confirmDialogAccept,
      reviewTargetSessionIds,
      sessionPanelExpantionStates,
      story,
      reviewableSessions,
      testMatrixName,
      groupName,
      statuses,
      doneSessionNum,
      extractionBugNum,
      testTargetName,
      viewPointName,
      canReviewSession,
      isCapturing,
      isReplaying,
      countPlannedSessions,
      updateStatus,
      addNewSession,
      changeSessionStatus,
      openConfirmDialogToDeleteSession
    };
  }
});
</script>
