<!--
 Copyright 2022 NTT Corporation.

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
  <v-container fluid class="pa-3 pt-4">
    <v-toolbar color="latteart-main" dark fixed app clipped-right>
      <v-toolbar-title>{{
        $store.getters.message("story-view.story")
      }}</v-toolbar-title>
    </v-toolbar>

    <v-layout row wrap v-if="story">
      <v-flex x3>
        <v-container fluid class="pa-2">
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.test-matrix')"
            :value="testMatrixName"
          ></v-text-field>
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.group')"
            :value="groupName"
          ></v-text-field>
        </v-container>
      </v-flex>

      <v-flex xs3>
        <v-container fluid class="pa-2">
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.test-target')"
            :value="testTargetName"
          ></v-text-field>
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.viewPoint')"
            :value="viewPointName"
          ></v-text-field>
          <v-select
            class="pt-0"
            :items="statuses"
            item-text="text"
            item-value="value"
            :value="story.status"
            :label="this.$store.getters.message('story-view.status')"
            :readonly="isViewerMode"
            @change="updateStatus"
          ></v-select>
        </v-container>
      </v-flex>

      <v-flex xs3>
        <v-container fluid class="pa-2">
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.planned-session')"
            :value="countPlannedSessions()"
          ></v-text-field>
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.completed-session')"
            v-model="doneSessionNum"
          ></v-text-field>
          <v-text-field
            class="pt-0"
            readonly
            :label="this.$store.getters.message('story-view.bug-count')"
            v-model="extractionBugNum"
          ></v-text-field>
        </v-container>
      </v-flex>

      <v-flex xs3>
        <v-container fluid>
          <v-select
            :items="reviewableSessions"
            :label="this.$store.getters.message('story-view.review-target')"
            item-text="displayName"
            item-value="id"
            v-model="reviewTargetSessionId"
          ></v-select>
          <v-layout row>
            <v-spacer></v-spacer>
            <review-button
              :disabled="!canReviewSession"
              :story="story"
              :sessionId="reviewTargetSessionId"
            ></review-button>
          </v-layout>
        </v-container>
      </v-flex>

      <v-flex xs12>
        <v-container fluid class="pa-0">
          <v-expansion-panel
            class="py-0 mb-2"
            v-model="sessionPanelExpantionStates"
            expand
          >
            <v-expansion-panel-content
              v-for="(session, index) in story.sessions"
              :key="session.id"
              class="py-0"
            >
              <template v-slot:header class="py-0">
                <div>
                  {{
                    `${$store.getters.message(
                      "session-list.session-name-base"
                    )} ${index + 1}`
                  }}
                </div>
                <div @click="$event.stopPropagation()">
                  <v-checkbox
                    :input-value="session.isDone"
                    @change="(value) => changeSessionStatus(session.id, value)"
                    :label="$store.getters.message('session-list.complete')"
                    :readonly="isViewerMode"
                    :id="`completedSessionCheckBox${index}`"
                  ></v-checkbox>
                </div>
                <v-btn
                  v-if="!isViewerMode"
                  @click="
                    $event.stopPropagation();
                    openConfirmDialogToDeleteSession(session.id);
                  "
                  small
                  >{{ $store.getters.message("session-list.delete") }}</v-btn
                >
              </template>

              <session-info
                :storyId="story.id"
                :sessionId="session.id"
              ></session-info>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-btn
            v-if="!isViewerMode"
            @click="addNewSession"
            id="addSessionButton"
            >{{ $store.getters.message("story-view.add-session") }}</v-btn
          >
        </v-container>
      </v-flex>
    </v-layout>

    <v-footer app height="auto" color="latteart-main">
      <v-container fluid class="py-0">
        <v-layout row justify-end>
          <v-spacer></v-spacer>
          <v-btn @click="toIndex">{{
            $store.getters.message("edit-footer.top")
          }}</v-btn>
        </v-layout>
      </v-container>
    </v-footer>

    <confirm-dialog
      :opened="confirmDialogOpened"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :onAccept="confirmDialogAccept"
      @close="confirmDialogOpened = false"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  Plan,
  TestMatrix,
  TestTarget,
  ViewPoint,
  Story,
  Session,
} from "@/lib/testManagement/types";
import { CHARTER_STATUS } from "@/lib/testManagement/Enum";
import ReviewButton from "./organisms/ReviewButton.vue";
import ConfirmDialog from "@/components/pages/common/ConfirmDialog.vue";
import SessionInfo from "./organisms/SessionInfo.vue";

@Component({
  components: {
    "session-info": SessionInfo,
    "review-button": ReviewButton,
    "confirm-dialog": ConfirmDialog,
  },
})
export default class StoryView extends Vue {
  private isViewerMode = (this as any).$isViewerMode
    ? (this as any).$isViewerMode
    : false;

  private confirmDialogOpened = false;
  private confirmDialogTitle = "";
  private confirmDialogMessage = "";
  private confirmDialogAccept() {
    /* Do nothing */
  }

  private reviewTargetSessionId = "";

  private sessionPanelExpantionStates: boolean[] = [];

  async created(): Promise<void> {
    if (!this.isViewerMode) {
      await this.$store.dispatch("testManagement/readStory", {
        storyId: this.$route.params.id,
      });
    }

    this.$store.dispatch("changeWindowTitle", {
      title: this.$store.getters.message("story-view.window-title"),
    });

    const sessionPanelExpantionStatesKey = `latteart-management-sessionPanelExpantionStates_${this.storyId}`;

    this.sessionPanelExpantionStates = JSON.parse(
      localStorage.getItem(sessionPanelExpantionStatesKey) ?? "[]"
    );

    this.$once("hook:beforeDestroy", () => {
      if (this.sessionPanelExpantionStates.length === 0) {
        localStorage.removeItem(sessionPanelExpantionStatesKey);
        return;
      }

      localStorage.setItem(
        sessionPanelExpantionStatesKey,
        JSON.stringify(this.sessionPanelExpantionStates)
      );
    });
  }

  private get storyId(): string {
    return this.$route.params.id;
  }

  private get story(): Story | undefined {
    return this.$store.getters["testManagement/findStory"](this.storyId);
  }

  public get reviewableSessions(): {
    id: string | undefined;
    displayName: string;
  }[] {
    if (!this.story) {
      return [];
    }

    const reviewableSessions: Session[] = this.$store.getters[
      "testManagement/collectReviewableSessions"
    ](this.story.id);

    return reviewableSessions.map((session) => {
      const sessionNameSuffix =
        this.story?.sessions.findIndex(({ id }) => id === session.id) ?? -1;

      return {
        id: session.id,
        displayName: `${this.$store.getters.message("story-view.session")}${
          sessionNameSuffix + 1
        }`,
      };
    });
  }

  private get testMatrixName(): string {
    if (!this.testMatrix) {
      return "";
    }
    return this.testMatrix.name;
  }

  private get groupName(): string {
    if (!this.testMatrix) {
      return "";
    }

    const targetGroup = this.testMatrix.groups.find((group) => {
      return group.testTargets.some(
        (testTarget) => testTarget.id === this.testTarget?.id
      );
    });

    if (!targetGroup) {
      return "";
    }

    return targetGroup.name;
  }

  private get statuses() {
    return [
      {
        text: this.$store.getters.message(
          `viewPoint-status.${CHARTER_STATUS.OUT_OF_SCOPE.id}`
        ),
        value: CHARTER_STATUS.OUT_OF_SCOPE.id,
      },
      {
        text: this.$store.getters.message(
          `viewPoint-status.${CHARTER_STATUS.OK.id}`
        ),
        value: CHARTER_STATUS.OK.id,
      },
      {
        text: this.$store.getters.message(
          `viewPoint-status.${CHARTER_STATUS.NG.id}`
        ),
        value: CHARTER_STATUS.NG.id,
      },
      {
        text: this.$store.getters.message(
          `viewPoint-status.${CHARTER_STATUS.ONGOING.id}`
        ),
        value: CHARTER_STATUS.ONGOING.id,
      },
      {
        text: this.$store.getters.message(
          `viewPoint-status.${CHARTER_STATUS.PENDING.id}`
        ),
        value: CHARTER_STATUS.PENDING.id,
      },
    ];
  }

  private get doneSessionNum(): number {
    return (
      this.story?.sessions.filter((session: Session) => {
        return session.isDone;
      }).length ?? 0
    );
  }

  private get extractionBugNum(): number {
    return (
      this.story?.sessions.reduce((bugNum, currentSession) => {
        if (!currentSession.isDone) {
          return bugNum;
        }

        bugNum += currentSession.notes.filter((note) => {
          (note.tags ?? []).includes("reported");
        }).length;

        return bugNum;
      }, 0) ?? 0
    );
  }

  private get testMatrix(): TestMatrix | undefined {
    return this.$store.getters["testManagement/findTestMatrix"](
      this.story?.testMatrixId ?? ""
    );
  }

  private get testTarget(): TestTarget | undefined {
    return this.testMatrix?.groups
      .flatMap((group) => group.testTargets)
      .find((testTarget) => this.story?.testTargetId === testTarget.id);
  }

  private get testTargetName(): string {
    if (!this.testTarget) {
      return "";
    }
    return this.testTarget.name;
  }

  private get viewPoint(): ViewPoint | undefined {
    if (!this.testMatrix) {
      return undefined;
    }
    return this.testMatrix.viewPoints.find((viewPoint) => {
      return viewPoint.id === this.story?.viewPointId;
    });
  }

  private get viewPointName(): string {
    if (!this.viewPoint) {
      return "";
    }
    return this.viewPoint.name;
  }

  private get plan(): Plan | undefined {
    if (!this.testTarget) {
      return undefined;
    }
    return this.testTarget.plans.find((plan: Plan) => {
      return plan.viewPointId === this.story?.viewPointId;
    });
  }

  private get canReviewSession(): boolean {
    return this.reviewTargetSessionId !== "";
  }

  private toIndex(): void {
    this.$store.commit("testManagement/clearTempStory");
    this.$router.push({ name: "manageShowView" });
  }

  private countPlannedSessions(): number {
    if (!this.plan) {
      return 0;
    }
    return this.plan.value;
  }

  private updateStatus(value: string) {
    this.$store.dispatch("testManagement/updateStory", {
      storyId: this.storyId,
      params: {
        status: value,
      },
    });
  }

  private addNewSession() {
    this.$store.dispatch("testManagement/addNewSession", {
      storyId: this.storyId,
    });

    this.sessionPanelExpantionStates.push(false);
  }

  private changeSessionStatus(sessionId: string, isDone: boolean): void {
    this.$store.dispatch("testManagement/updateSession", {
      storyId: this.storyId,
      sessionId,
      params: {
        isDone,
      },
    });
  }

  private openConfirmDialogToDeleteSession(sessionId: string) {
    this.confirmDialogTitle = this.$store.getters.message(
      "session-list.delete-session"
    );
    this.confirmDialogMessage = this.$store.getters.message(
      "common.delete-warning"
    );
    this.confirmDialogAccept = () => {
      this.$store.dispatch("testManagement/deleteSession", {
        storyId: this.storyId,
        sessionId,
      });
    };

    this.confirmDialogOpened = true;
  }
}
</script>
