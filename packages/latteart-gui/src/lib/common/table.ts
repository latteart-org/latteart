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

export function filterTableRows<T>(rows: T[], predicates: ((item: T) => boolean)[]): T[] {
  return rows.filter((row) => {
    return predicates.every((filteringPredicate) => {
      return filteringPredicate(row);
    });
  });
}

export function sortTableRows<T>(rows: T[], sortBy: string, sortDesc: boolean = false): T[] {
  return rows.slice().sort((rowA, rowB) => {
    const valueA =
      sortBy.split(".").reduce((acc: any, pathItem) => {
        return acc ? acc[pathItem] : acc;
      }, rowA) ?? "";
    const valueB =
      sortBy.split(".").reduce((acc: any, pathItem) => {
        return acc ? acc[pathItem] : acc;
      }, rowB) ?? "";

    return (valueA >= valueB ? 1 : -1) * (sortDesc ? -1 : 1);
  });
}
