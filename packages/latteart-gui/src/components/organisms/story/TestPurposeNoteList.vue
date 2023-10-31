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
      <v-card-text
        v-for="(displayedItem, itemIndex) in displayedItems"
        class="py-0"
        :key="displayedItem.testResultId"
      >
        <span class="test-purpose-h">
          {{ testResultName(displayedItem.testResultId) }}
        </span>
        <v-list expand class="pt-0">
          <v-list-group
            v-for="(
              testPurpose, testPurposeIndex
            ) in displayedItem.testPurposes"
            v-model="selectedItems[itemIndex][testPurposeIndex]"
            :key="testPurpose.title"
            value="true"
            no-action
            two-line
            :id="`testPurposeArea${testPurposeIndex}`"
            :prepend-icon="
              selectedItems[itemIndex][testPurposeIndex]
                ? 'arrow_drop_up'
                : 'arrow_drop_down'
            "
            :append-icon="null"
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
                ><v-list-item-subtitle>
                  <note-tag-chip-group :tags="note.tags"></note-tag-chip-group
                ></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  @click="
                    openNoteDetails(
                      note.id,
                      note.value,
                      note.details,
                      note.imageFileUrl,
                      note.videoUrl,
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
      :testResultId="testResultId"
      :noteId="noteId"
      :summary="summary"
      :details="details"
      :tags="tags"
      :imageFilePath="imagePath"
      @execute="reload()"
      :videoUrl="videoUrl"
      @close="opened = false"
    />

    <scrollable-dialog :opened="testPurposeOpened">
      <template v-slot:title>{{
        $store.getters.message("note-details-dialog.details")
      }}</template>

      <template v-slot:content>
        <v-list class="note-details-dialog">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("note-details-dialog.summary")
              }}</v-list-item-title>
              <p class="break-all">{{ summary }}</p>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{
                $store.getters.message("note-details-dialog.details")
              }}</v-list-item-title>
              <p class="break-all pre-wrap">{{ details }}</p>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>

      <template v-slot:footer>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="testPurposeOpened = false">{{
          $store.getters.message("common.close")
        }}</v-btn>
      </template>
    </scrollable-dialog>
  </div>
</template>

<script lang="ts">
import ScrollableDialog from "@/components/molecules/ScrollableDialog.vue";
import NoteTagChipGroup from "@/components/organisms/common/NoteTagChipGroup.vue";
import { Session } from "@/lib/testManagement/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import NoteDetailsDialog from "./NoteDetailsDialog.vue";

type DisplayedItem = {
  testResultId: string;
  testPurposes: {
    id: string;
    type: string;
    details: string;
    value: string;
    notes: {
      id: string;
      type: string;
      value: string;
      details: string;
      tags: string[];
      imageFileUrl: string;
      videoUrl: string;
    }[];
  }[];
};

@Component({
  components: {
    "note-details-dialog": NoteDetailsDialog,
    "note-tag-chip-group": NoteTagChipGroup,
    "scrollable-dialog": ScrollableDialog,
  },
})
export default class TestPurposeNoteList extends Vue {
  @Prop({ type: Array, default: [] })
  public readonly testPurposes?: Session["testPurposes"];
  @Prop({ type: Array, default: [] })
  public readonly testResult?: Session["testResultFiles"];

  private opened = false;
  private testPurposeOpened = false;

  private testResultId = "";
  private noteId = "";
  private summary = "";
  private details = "";
  private imagePath = "";
  private videoUrl = "";
  private tags: string[] = [];
  private selectedItems: boolean[][] = [];
  private displayedItems: DisplayedItem[] = [];

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
    console.log(this.selectedItems);
    return this.selectedItems.every((items) => {
      return items.every((opened) => opened === true);
    });
  }

  private testResultName(id: string): string {
    return this.testResult?.find((result) => result.id === id)?.name ?? "";
  }

  private openTestPurposeDetails(value: string, details: string) {
    this.summary = value;
    this.details = details;
    this.testPurposeOpened = true;
  }

  private openNoteDetails(
    id: string,
    summary: string,
    text: string,
    imageFilePath: string,
    videoUrl: string,
    tags: string[]
  ) {
    this.testResultId = this.testResult?.at(0)?.id ?? "";
    this.noteId = id;
    this.summary = summary;
    this.details = text;
    this.imagePath = imageFilePath;
    this.videoUrl = videoUrl;
    this.tags = tags ?? [];
    this.opened = true;
  }

  private openAllTestPurposes() {
    this.selectedItems = this.displayedItems.map((item) => {
      return item.testPurposes.map(() => !this.isAllSelect);
    });
  }

  private createDisplayedTestPurposes(testPurposes: Session["testPurposes"]) {
    this.displayedItems = testPurposes
      .map((testPurpose) => {
        const value =
          testPurpose.value !== ""
            ? testPurpose.value
            : (this.$store.getters.message(
                "test-purpose-note-list.no-test-purpose"
              ) as string);
        const notes = testPurpose.notes.map((note) => {
          const { id, type, value, details, tags, imageFileUrl } = note;

          return {
            id,
            type,
            value,
            details,
            tags,
            imageFileUrl,
            videoUrl: note.videoFrame
              ? `${note.videoFrame.url}#t=${note.videoFrame.time}`
              : "",
          };
        });

        return {
          testPurpose: { ...testPurpose, value, notes },
        };
      })
      .reduce((acu, cur) => {
        const displayedItem = acu.find(
          (testPurpose) =>
            testPurpose.testResultId === cur.testPurpose.testResultId
        );
        if (displayedItem) {
          displayedItem.testPurposes.push(cur.testPurpose);
        } else {
          acu.push({
            testResultId: cur.testPurpose.testResultId,
            testPurposes: [cur.testPurpose],
          });
        }
        return acu;
      }, [] as DisplayedItem[]);
    this.selectedItems = this.displayedItems.map((item) => {
      return item.testPurposes.map(() => true);
    });
  }

  private reload() {
    this.$emit("reload");
  }
}
</script>

<style lang="sass" scoped>
.note-details-dialog
  .v-list__tile
    font-size: 12px
    height: auto
    padding: 4px 16px
  .v-list__tile__title
    font-size: 12px
    height: auto
    line-height: normal
  .break-all
    font-size: 12px

.test-purpose-h
  display: block
  margin: 12px 0 -4px 4px
</style>
