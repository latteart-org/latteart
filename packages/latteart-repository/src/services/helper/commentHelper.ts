/**
 * Copyright 2024 NTT Corporation.
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

export type ImportCommentData = {
  testResult: string;
  value: string;
  timestamp: number;
}[];

export const deserializeComments = (
  commentDatas: string[],
  testResultId: string,
  idMap?: Map<string, string>
) => {
  return commentDatas
    .map((comment) => {
      const data = JSON.parse(comment) as {
        id: string;
        testResult: string;
        value: string;
        timestamp: number;
      }[];
      if (data.length === 0) {
        return null;
      }
      const newTestResultId = idMap
        ? idMap.get(data[0].testResult)
        : testResultId;
      return {
        testResultId: newTestResultId,
        data: data.map((d) => {
          return { value: d.value, timestamp: d.timestamp };
        }),
      };
    })
    .filter((comment) => comment) as {
    testResultId: string;
    data: {
      testResult: string;
      value: string;
      timestamp: number;
    }[];
  }[];
};
