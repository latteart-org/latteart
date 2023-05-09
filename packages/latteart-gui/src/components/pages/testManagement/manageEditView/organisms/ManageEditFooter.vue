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
  <v-footer app height="auto" color="latteart-main">
    <v-container fluid>
      <v-row>
        <v-spacer></v-spacer>
        <v-btn id="toTopFromEditPlanButton" @click="toIndex">{{
          $store.getters.message("edit-footer.top")
        }}</v-btn>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class ManageEditFooter extends Vue {
  public toIndex(): void {
    this.$emit("cancel");
  }
}
</script>
