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
  <div class="mt-0 pt-0">
    <v-card class="ma-2">
      <v-card-title>{{
        $store.getters.message("test-purpose-note-list.title")
      }}</v-card-title>
      <v-btn class="ml-10" small @click="openAllTestPurposes()">{{
        isAllSelect
          ? $store.getters.message("test-purpose-note-list.close")
          : $store.getters.message("test-purpose-note-list.open")
      }}</v-btn>
      <v-card-text class="py-0">
        <v-list>
          <v-list-group
            v-for="(testPurpose, index) in viewTestPurposes"
            v-model="testPurpose.active"
            :key="testPurpose.title"
            value="true"
            no-action
            sub-group
            two-line
            :id="`testPurposeArea${index}`"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title
                  ><span :title="testPurpose.value">{{
                    testPurpose.value
                  }}</span></v-list-item-title
                >
                <v-list-item-subtitle>{{
                  testPurpose.details
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  @click.stop="
                    openTestPurposeDetails(
                      testPurpose.type,
                      testPurpose.value,
                      testPurpose.details
                    )
                  "
                  >{{
                    $store.getters.message("test-purpose-note-list.details")
                  }}</v-btn
                >
              </v-list-item-action>
            </template>
            <v-list-item
              two-line
              link
              v-for="(note, i) in testPurpose.notes"
              :key="i"
            >
              <v-list-item-content>
                <v-list-item-title
                  ><span :title="note.value">{{
                    note.value
                  }}</span></v-list-item-title
                >
                <v-list-item-subtitle>{{
                  $store.getters.message("test-purpose-note-list.bug-status", {
                    status: note.status,
                  })
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  @click="
                    openNoteDetails(
                      note.type,
                      note.status,
                      note.value,
                      note.details,
                      note.imageFileUrl,
                      note.tags
                    )
                  "
                  >{{
                    $store.getters.message("test-purpose-note-list.details")
                  }}</v-btn
                >
              </v-list-item-action>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-card-text>

      <v-card-actions></v-card-actions>
    </v-card>
    <note-details-dialog
      :opened="opened"
      :type="type"
      :status="status"
      :summary="summary"
      :details="details"
      :tags="tags"
      :imageFilePath="imagePath"
      @close="opened = false"
    />
  </div>
</template>

<script lang="ts">
import { Session } from "@/lib/testManagement/types";
import { Component, Prop, Vue } from "vue-property-decorator";
import NoteDetailsDialog from "./NoteDetailsDialog.vue";

@Component({
  components: {
    "note-details-dialog": NoteDetailsDialog,
  },
})
export default class TestPurposeNoteList extends Vue {
  @Prop({ type: Array, default: [] })
  public readonly testPurposes?: Session["testPurposes"];

  private opened = false;
  private type = "";
  private status = "";
  private summary = "";
  private details = "";
  private imagePath = "";
  private tags: string[] = [];
  private viewTestPurposes: {
    value: string;
    notes: {
      status: string;
      value: string;
      details: string;
      tags: string[];
      imageFileUrl: string;
    }[];
    active: boolean;
    id: string;
    type: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
  }[] = [];

  private mounted() {
    if (!this.testPurposes) {
      return;
    }
    const none = this.$store.getters.message(
      "test-purpose-note-list.none"
    ) as string;
    const tmpTestPurposes = this.testPurposes.map((testPurpose) => {
      return {
        ...testPurpose,
        value:
          testPurpose.value !== ""
            ? testPurpose.value
            : (this.$store.getters.message(
                "test-purpose-note-list.no-test-purpose"
              ) as string),
        notes: testPurpose.notes.map((note) => {
          const status = (() => {
            if (!note.tags) {
              return none;
            }

            if (note.tags.includes("reported")) {
              return this.$store.getters.message(
                "test-purpose-note-list.bug-reported"
              ) as string;
            }

            if (note.tags.includes("invalid")) {
              return this.$store.getters.message(
                "test-purpose-note-list.bug-unreported"
              ) as string;
            }

            return none;
          })();

          return {
            status,
            value: note.value,
            details: note.details,
            tags: note.tags ?? [],
            imageFileUrl: note.imageFileUrl ?? "",
          };
        }),
        active: true,
      };
    });

    this.viewTestPurposes = tmpTestPurposes;
  }

  private get isAllSelect() {
    const activeList = this.viewTestPurposes.map((testPurpose) => {
      return testPurpose.active;
    });

    return !activeList.includes(false);
  }

  private openTestPurposeDetails(type: string, value: string, details: string) {
    this.type = type;
    this.summary = value;
    this.details = details;
    this.opened = true;
  }

  private openNoteDetails(
    type: string,
    status: string,
    summary: string,
    text: string,
    imageFilePath: string,
    tags: string[]
  ) {
    this.type = type;
    this.status = status;
    this.summary = summary;
    this.details = text;
    this.imagePath = imageFilePath;
    this.tags = tags ?? [];
    this.opened = true;
  }

  private openAllTestPurposes() {
    if (this.isAllSelect) {
      for (const [index] of this.viewTestPurposes.entries()) {
        this.viewTestPurposes[index].active = false;
      }
    } else {
      for (const [index] of this.viewTestPurposes.entries()) {
        this.viewTestPurposes[index].active = true;
      }
    }
  }
}
</script>
