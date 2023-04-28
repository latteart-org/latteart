/**
 * Copyright 2023 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface NoteTagPreset {
  items: {
    name: string;
    color: string;
  }[];
}

export const noteTagPreset: NoteTagPreset = {
  items: [
    {
      name: "bug",
      color: "#FF8A80",
    },
    {
      name: "reported",
      color: "#FFFF8D",
    },
    {
      name: "invalid",
      color: "#9E9E9E",
    },
  ],
};
