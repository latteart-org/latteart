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

import type { Story } from "./types";

export function createQualityTableBuilder(config: {
  totalRowId: string;
  totalRowName: string;
  informationColumnIds: { testMatrix: string; group: string; testTarget: string; total: string };
}) {
  return {
    buildQualityTable(
      stories: (Story & {
        viewPointName: string;
        testTargetName: string;
        testMatrixName: string;
        groupName: string;
      })[]
    ) {
      const storyMetrics = stories.map((story) => {
        const doneSessions = story.sessions.filter((session) => session.isDone);

        return {
          testMatrixName: story.testMatrixName,
          groupName: story.groupName,
          testTargetName: story.testTargetName,
          viewPointName: story.viewPointName,
          storyId: story.id,
          testMatrixId: story.testMatrixId,
          testTargetId: story.testTargetId,
          viewPointId: story.viewPointId,
          doneSessionNum: doneSessions.length,
          bugNum: doneSessions
            .flatMap((session) => session.notes)
            .filter((note) => (note.tags ?? []).includes("bug")).length
        };
      });

      const qualityTable = ((storyMetrics) => {
        const testTargetIdToRow = Array.from(
          storyMetrics
            .reduce((acc, storyMetric) => {
              const testTargetMetrics = acc.get(storyMetric.testTargetId);

              acc.set(storyMetric.testTargetId, {
                testMatrixName: storyMetric.testMatrixName,
                groupName: storyMetric.groupName,
                testTargetName: storyMetric.testTargetName,
                cells: {
                  ...(testTargetMetrics?.cells ?? {}),
                  [storyMetric.viewPointId]: {
                    doneSessionNum: storyMetric.doneSessionNum,
                    bugNum: storyMetric.bugNum
                  }
                }
              });

              return acc;
            }, new Map<string, { testMatrixName: string; groupName: string; testTargetName: string; cells: { [viewPointId: string]: { doneSessionNum: number; bugNum: number } } }>())
            .entries()
        );

        const cells = Object.fromEntries(
          storyMetrics
            .reduce((acc, storyMetric) => {
              const viewPointMetric = acc.get(storyMetric.viewPointId);

              acc.set(storyMetric.viewPointId, {
                viewPointName: storyMetric.viewPointName,
                doneSessionNum: viewPointMetric?.doneSessionNum ?? 0 + storyMetric.doneSessionNum,
                bugNum: viewPointMetric?.bugNum ?? 0 + storyMetric.bugNum
              });

              return acc;
            }, new Map<string, { viewPointName: string; doneSessionNum: number; bugNum: number }>())
            .entries()
        );

        const totalCellValue = Object.values(cells).reduce(
          (acc, cell) => {
            return {
              doneSessionNum: acc.doneSessionNum + cell.doneSessionNum,
              bugNum: acc.bugNum + cell.bugNum
            };
          },
          { doneSessionNum: 0, bugNum: 0 }
        );
        const totalCell = {
          [config.informationColumnIds.total]: totalCellValue
        };

        const testTargetQualityRows = Object.fromEntries(
          testTargetIdToRow.map(([testTargetId, row]) => {
            const totalCellValue = Object.values(row.cells).reduce(
              (acc, cell) => {
                return {
                  doneSessionNum: acc.doneSessionNum + cell.doneSessionNum,
                  bugNum: acc.bugNum + cell.bugNum
                };
              },
              { doneSessionNum: 0, bugNum: 0 }
            );
            const totalCell = {
              [config.informationColumnIds.total]: totalCellValue
            };

            return [
              testTargetId,
              {
                [config.informationColumnIds.testMatrix]: row.testMatrixName,
                [config.informationColumnIds.group]: row.groupName,
                [config.informationColumnIds.testTarget]: row.testTargetName,
                ...row.cells,
                ...totalCell
              }
            ];
          })
        );

        const totalQualityRow = {
          [config.totalRowId]: {
            [config.informationColumnIds.testMatrix]: config.totalRowName,
            [config.informationColumnIds.group]: " ",
            [config.informationColumnIds.testTarget]: " ",
            ...cells,
            ...totalCell
          }
        };

        const columnNames = [
          { colName: config.informationColumnIds.testMatrix },
          { colName: config.informationColumnIds.group },
          { colName: config.informationColumnIds.testTarget },
          ...Object.entries(cells).map(([colName, cell]) => {
            return { colName, text: cell.viewPointName };
          }),
          { colName: config.informationColumnIds.total }
        ];

        return {
          getHeaderColumns(): { colName: string; text?: string }[] {
            return columnNames;
          },
          collectTestTargetQualityRows(): {
            [testTargetId: string]: {
              [colName: string]: string | { doneSessionNum: number; bugNum: number };
            };
          } {
            return testTargetQualityRows;
          },
          getTotalQualityRow(): {
            [testTargetId: string]: {
              [colName: string]: string | { doneSessionNum: number; bugNum: number };
            };
          } {
            return totalQualityRow;
          }
        };
      })(storyMetrics);

      return qualityTable;
    }
  };
}
