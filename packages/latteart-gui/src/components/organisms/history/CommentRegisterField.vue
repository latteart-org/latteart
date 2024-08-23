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
  <v-text-field
    v-model="comment"
    :label="$t('test-result-page.comment-register-field-label')"
    variant="outlined"
    density="compact"
    hide-details
    class="mt-n1 mx-2"
    @click:append-inner="addComment"
    @keydown.enter.prevent="addComment"
  >
    <template #append-inner>
      <v-btn
        :disabled="isRegisterButtonDisabled"
        density="compact"
        variant="plain"
        icon="sms"
        @click="addComment"
      ></v-btn>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useOperationHistoryStore } from "@/stores/operationHistory";

export default defineComponent({
  setup() {
    const operationHistoryStore = useOperationHistoryStore();

    const comment = ref("");
    const isSaving = ref(false);

    const isRegisterButtonDisabled = computed(() => {
      return comment.value === "" || isSaving.value;
    });

    const addComment = () => {
      if (isRegisterButtonDisabled.value) {
        return;
      }

      isSaving.value = true;

      operationHistoryStore
        .addComment({
          comment: comment.value,
          timestamp: new Date().getTime()
        })
        .then(() => {
          comment.value = "";
          isSaving.value = false;
        });
    };

    return {
      comment,
      addComment,
      isRegisterButtonDisabled
    };
  }
});
</script>
