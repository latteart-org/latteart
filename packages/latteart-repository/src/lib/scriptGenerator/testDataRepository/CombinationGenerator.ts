/**
 * Copyright 2022 NTT Corporation.
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

export class CombinationGenerator {
  constructor(private maxGeneration: number) {}

  public generate<T>(...arrays: T[][]): T[][] {
    const notEmptyArrays = arrays.filter((source) => source.length > 0);

    const limitGeneration = notEmptyArrays.reduce((acc, array) => {
      return acc * array.length;
    }, 1);

    const generationNum =
      this.maxGeneration < limitGeneration
        ? this.maxGeneration
        : limitGeneration;

    return this.combine(notEmptyArrays, generationNum);
  }

  private combine<T>(arrays: T[][], generationNum: number) {
    const { combined } = [...Array(generationNum)].reduce(
      (acc: { combined: T[][]; arrayCounts: number[] }) => {
        const generated = arrays.map((array, arrayIndex) => {
          const columnIndex = acc.arrayCounts[arrayIndex];
          return array[columnIndex];
        });

        acc.combined.push(generated);

        acc.arrayCounts = [
          ...acc.arrayCounts.map(
            (currentArrayCount, currentArrayCountIndex, allArrayCounts) => {
              const subsequentArrayCountsCanIncrease =
                allArrayCounts.findIndex((count, index) => {
                  return (
                    index > currentArrayCountIndex &&
                    count < arrays[index].length - 1
                  );
                }) !== -1;

              const currentArray = arrays[currentArrayCountIndex];

              if (subsequentArrayCountsCanIncrease) {
                return currentArrayCount;
              } else {
                if (currentArrayCount < currentArray.length - 1) {
                  return currentArrayCount + 1;
                } else {
                  return 0;
                }
              }
            }
          ),
        ];

        return acc;
      },
      { combined: [], arrayCounts: [...Array<number>(arrays.length).fill(0)] }
    );

    return combined;
  }
}
