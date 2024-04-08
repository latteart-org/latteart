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
  <v-card v-if="displayed" class="py-0 my-3" @click="toStory">
    <v-card-title primary-title class="py-1 my-0" v-bind:class="cardStyle">
      <p class="card-center">
        {{ $t(`test-matrix-page.status-${status}`) }}
      </p>
    </v-card-title>
    <v-divider light></v-divider>
    <v-card-actions class="py-0 my-0">
      <p class="card-center">{{ done }} / {{ plan }}</p>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { type Session } from "@/lib/testManagement/types";
import { CHARTER_STATUS } from "@/lib/testManagement/Enum";
import { computed, defineComponent, type PropType } from "vue";
import { useTestManagementStore } from "@/stores/testManagement";
import { useRouter } from "vue-router";
import { useRootStore } from "@/stores/root";

export default defineComponent({
  props: {
    plan: { type: Number, default: -1, required: true },
    id: { type: String, default: "", required: true },
    displayedStories: {
      type: Array as PropType<string[] | null>,
      default: null
    }
  },
  setup(props) {
    const rootStore = useRootStore();
    const testManagementStore = useTestManagementStore();
    const router = useRouter();

    const story = computed(() => {
      return testManagementStore.findStory(props.id);
    });

    const cardStyle = computed((): "" | "status-fine" | "status-ng" | "status-warn" => {
      switch (status.value) {
        case CHARTER_STATUS.OUT_OF_SCOPE.id:
        case CHARTER_STATUS.OK.id:
          return "status-fine";
        case CHARTER_STATUS.NG.id:
          return "status-ng";
        case CHARTER_STATUS.ONGOING.id:
        case CHARTER_STATUS.PENDING.id:
          return "status-warn";
      }
      return "";
    });

    const status = computed(() => {
      if (story.value) {
        return story.value.status;
      }

      return CHARTER_STATUS.OUT_OF_SCOPE.id;
    });

    const done = computed((): number => {
      if (!story.value) {
        return 0;
      }
      let doneNum = 0;
      story.value.sessions.forEach((session: Session) => {
        if (session.isDone) {
          doneNum++;
        }
      });
      return doneNum;
    });

    const toStory = (): void => {
      router.push({
        name: "storyPage",
        params: { id: props.id }
      });
    };

    const displayed = computed((): boolean => {
      return props.displayedStories === null
        ? true
        : !!props.displayedStories.find((id) => id === props.id);
    });

    return {
      t: rootStore.message,
      displayed,
      cardStyle,
      status,
      done,
      toStory
    };
  }
});
</script>

<style lang="sass" scoped>
.card-center
  margin: auto
  text-align: center
  font-size: medium

.status-base
  font-weight: bold
  min-width: 120px
  cursor: pointer

.status-fine
  background-color: #DEF9CD
  color: #690
  @extend .status-base
  &:hover
    background-color: #690
    color: #DEF9CD

.status-ng
  background-color: #FBE0E5
  color: #c00
  font-weight: bold
  @extend .status-base
  &:hover
    background-color: #c00
    color: #FBE0E5

.status-warn
  background-color: #FBE9E0
  color: #EA5F1A
  @extend .status-base
  &:hover
    background-color: #EA5F1A
    color: #FBE9E0
</style>
