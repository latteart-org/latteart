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
      <v-btn
        v-if="displayedItems.length > 0"
        class="ml-10"
        small
        @click="openAllTestPurposes()"
        >{{
          isAllSelect
            ? $store.getters.message("test-purpose-note-list.close")
            : $store.getters.message("test-purpose-note-list.open")
        }}</v-btn
      >
      <v-card-text class="py-0">
        <v-list>
          <v-list-group
            v-for="(item, index) in displayedItems"
            v-model="item.active"
            :key="item.testPurpose.title"
            value="true"
            no-action
            two-line
            :id="`testPurposeArea${index}`"
            :prepend-icon="item.active ? 'arrow_drop_up' : 'arrow_drop_down'"
            :append-icon="null"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title
                  ><span :title="item.testPurpose.value">{{
                    item.testPurpose.value
                  }}</span></v-list-item-title
                >
                <v-list-item-subtitle>{{
                  item.testPurpose.details
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  @click.stop="
                    openTestPurposeDetails(
                      item.testPurpose.type,
                      item.testPurpose.value,
                      item.testPurpose.details
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
              v-for="(note, i) in item.testPurpose.notes"
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
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
  private displayedItems: {
    testPurpose: {
      id: string;
      type: string;
      details: string;
      imageFileUrl: string;
      tags: string[];
      value: string;
      notes: {
        status: string;
        value: string;
        details: string;
        tags: string[];
        imageFileUrl: string;
      }[];
    };
    active: boolean;
  }[] = [];

  private mounted() {
    if (!this.testPurposes) {
      return;
    }

    this.createDisplayedTestPurposes(this.testPurposes);
  }

  @Watch("testPurposes")
  private changeTestPurposes() {
    if (this.testPurposes) {
      this.createDisplayedTestPurposes(this.testPurposes);
    } else {
      this.displayedItems = [];
    }
  }

  private get isAllSelect() {
    const activeList = this.displayedItems.map((testPurpose) => {
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
      for (const [index] of this.displayedItems.entries()) {
        this.displayedItems[index].active = false;
      }
    } else {
      for (const [index] of this.displayedItems.entries()) {
        this.displayedItems[index].active = true;
      }
    }
  }

  private createDisplayedTestPurposes(testPurposes: Session["testPurposes"]) {
    this.displayedItems = testPurposes.map((testPurpose) => {
      const value =
        testPurpose.value !== ""
          ? testPurpose.value
          : (this.$store.getters.message(
              "test-purpose-note-list.no-test-purpose"
            ) as string);
      const notes = testPurpose.notes.map((note) => {
        const status = (() => {
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

          return this.$store.getters.message(
            "test-purpose-note-list.none"
          ) as string;
        })();

        return { status, ...note };
      });

      return {
        testPurpose: { ...testPurpose, value, notes },
        active: true,
      };
    });
  }
}
</script>
