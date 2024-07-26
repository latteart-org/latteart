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
  <v-container fluid class="pa-4">
    <test-hint-list
      :test-hint-props="testHintProps"
      :test-hints="testHints"
      @click:edit-test-hint-button="openTestHintEditDialog"
      @click:delete-test-hint-button="openTestHintDeleteDialog"
    ></test-hint-list>
  </v-container>
</template>

<script lang="ts">
import { type TestHint, type TestHintProp } from "@/lib/operationHistory/types";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import TestHintList from "@/components/organisms/common/TestHintList.vue";

export default defineComponent({
  components: {
    "test-hint-list": TestHintList
  },
  setup() {
    const rootStore = useRootStore();
    const route = useRoute();

    const testHintProps = ref<TestHintProp[]>([]);
    const testHints = ref<TestHint[]>([]);

    const openTestHintEditDialog = (testHintId: string) => {
      console.log(`openTestHintEditDialog: ${testHintId}`);
    };

    const openTestHintDeleteDialog = (testHintId: string) => {
      console.log(`openTestHintDeleteDialog: ${testHintId}`);
    };

    const loadTestHints = async () => {
      if (!rootStore.dataLoader) {
        return;
      }

      const testHintPropsAndData = await rootStore.dataLoader.loadTestHints();

      testHintProps.value = testHintPropsAndData.props;
      testHints.value = testHintPropsAndData.data;
    };

    (async () => {
      rootStore.changeWindowTitle({
        title: rootStore.message(route.meta?.title ?? "")
      });

      await loadTestHints();
    })();

    return {
      testHintProps,
      testHints,
      openTestHintEditDialog,
      openTestHintDeleteDialog
    };
  }
});
</script>
