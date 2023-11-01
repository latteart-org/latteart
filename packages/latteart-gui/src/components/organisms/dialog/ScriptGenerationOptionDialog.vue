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
  <execute-dialog
    :opened="opened"
    :title="
      $store.getters.message('test-result-page.generate-testscript-title')
    "
    @accept="
      execute();
      close();
    "
    @cancel="close()"
  >
    <template>
      <script-generation-option
        v-if="isOptionDisplayed"
        @update="updateOption"
      />
    </template>
  </execute-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import ExecuteDialog from "@/components/molecules/ExecuteDialog.vue";
import ScriptGenerationOption from "../common/ScriptGenerationOption.vue";

@Component({
  components: {
    "execute-dialog": ExecuteDialog,
    "script-generation-option": ScriptGenerationOption,
  },
})
export default class ScriptGenerationOptionDialog extends Vue {
  @Prop({ type: Boolean, default: false }) public readonly opened?: boolean;

  private isOptionDisplayed: boolean = false;

  private option: {
    testScript: {
      isSimple: boolean;
      useMultiLocator: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
    buttonDefinitions: {
      tagname: string;
      attribute?: { name: string; value: string };
    }[];
  } = {
    testScript: {
      isSimple: false,
      useMultiLocator: false,
    },
    testData: {
      useDataDriven: false,
      maxGeneration: 0,
    },
    buttonDefinitions: [],
  };

  private updateOption(option: {
    testScript: {
      isSimple: boolean;
      useMultiLocator: boolean;
    };
    testData: {
      useDataDriven: boolean;
      maxGeneration: number;
    };
    buttonDefinitions: {
      tagname: string;
      attribute?: { name: string; value: string };
    }[];
  }) {
    this.option = option;
  }

  private execute(): void {
    this.$emit("execute", this.option);
  }

  private close(): void {
    this.$emit("close");
  }

  @Watch("opened")
  private rerenderOption() {
    if (this.opened) {
      this.isOptionDisplayed = false;
      this.$nextTick(() => {
        this.isOptionDisplayed = true;
      });
    }
  }
}
</script>
