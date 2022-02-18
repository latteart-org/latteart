/**
 * Copyright 2021 NTT Corporation.
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

import { OperationWithNotes } from "@/lib/operationHistory/types";
import { TimestampImpl } from "./Timestamp";

/**
 * Determine if type contains value.
 * @param value
 * @param type
 * @returns Returns true if included.
 */
export function isIncludeEnum(value: any, type: any): boolean {
  let result = false;
  Object.entries(type).forEach(([, v]) => {
    if (value === v) {
      result = true;
    }
  });
  return result;
}

/**
 * Returns an array of Enum values.
 * @param type  Enum
 * @returns An array of defined values for an enum.
 */
export function getEnumValues(type: any): any[] {
  const result: any[] = [];
  Object.entries(type).forEach(([, v]) => {
    result.push(v);
  });
  return result;
}

/**
 * Calculate session execution time.
 * @param startTimeStamp  Session start time.
 * @param endTimeStamp  Session end time.
 * @param history  Operation history.
 * @returns Elapsed time.
 */
export const calculateElapsedUnixTime = (
  startTimeStamp: number,
  endTimeStamp: number,
  history: OperationWithNotes[]
): number => {
  let testingTime;
  let endTime;
  const startEpochMilliseconds = new TimestampImpl(
    startTimeStamp
  ).epochMilliseconds();

  if (endTimeStamp <= 0) {
    let seq = history.length - 1;
    while (!endTime) {
      if (seq <= 0) {
        endTime = 0;
        break;
      }
      const lastHistory = history[seq--];
      if (
        !lastHistory ||
        !lastHistory.operation ||
        !lastHistory.operation.timestamp
      ) {
        continue;
      }
      endTime = new TimestampImpl(
        lastHistory.operation.timestamp
      ).epochMilliseconds();
    }

    testingTime = endTime - startEpochMilliseconds;
  } else {
    testingTime = endTimeStamp - startEpochMilliseconds;
  }
  return testingTime;
};

/**
 * Abbreviates the string to the specified number of characters and returns the ending as "...".
 * @param word  Target character string.
 * @param length  Number of characters you want to omit.
 * @returns  Character string omitted with the specified number of characters.
 */
export const abbreviatedCharLength = (word: string, length: number): string => {
  let ret = word;
  if (word.length + 3 >= length) {
    if (word.length >= length) {
      ret = word.substring(0, length - 3);
    } else {
      ret = word.substring(0, length - (length - word.length));
    }
    ret = `${ret}...`;
  }
  return ret;
};

/**
 * Compare arrays.
 * @param lhs
 * @param rhs
 * @returns Returns true if they match.
 */
export const arrayEquals = <T>(lhs: T[], rhs: T[]): boolean => {
  if (lhs.length !== rhs.length) {
    return false;
  }
  return !lhs.find((item, index) => {
    return item !== rhs[index];
  });
};

/**
 * Convert Blob to string and return in JSON format.
 * @param blob
 * @returns JSON object
 */
export const parseJsonBlob = async <T>(blob: Blob): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsText(blob, "utf8");

    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) ?? "";

        resolve(JSON.parse(text));
      } catch (error) {
        reject(error);
      }
    };
  });
};

/**
 * Search for values recursively.
 * @param keyPath  Key you want to search.
 * @param target  Search target.
 * @returns Search results
 */
export const findValueRecursively = (
  keyPath: string[],
  target: { [key: string]: any }
): any => {
  const head = keyPath[0];
  const tail = keyPath.slice(1);

  const value = target[head];

  if (value === undefined) {
    return undefined;
  }

  if (tail.length > 0) {
    return findValueRecursively(tail, value);
  }

  return value;
};

/**
 * Normalize xpath.
 * @param before  Xpath before normalization.
 * @returns Xpath after normalization
 */
export const normalizeXPath = (before: string): string => {
  return before.replace(/\[1\]/g, "");
};

/**
 * Collect innerText recursively.
 * @param element  Elements to be collected.
 * @param textSet  Set to store innerText.
 */
const ignoreTags = ["SCRIPT", "STYLE", "HEAD"];

const extractKeywordsFromInputAndTextareaTag = (
  element: HTMLElement
): string[] | null => {
  const tagName = element.tagName.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA") {
    const results = [];

    const placeholder = element.getAttribute("placeholder");
    if (placeholder) {
      results.push(placeholder);
    }

    const type = element.getAttribute("type");
    if (type === "button" || type === "submit") {
      const value = element.getAttribute("value");
      if (value) {
        results.push(value);
      }
    }
    return results;
  }
  return null;
};

const extractKeywordsFromInnerText = (element: HTMLElement): string | null => {
  const tagName = element.tagName.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA") {
    return null;
  }
  if (element.innerText) {
    return element.innerText;
  }
  return null;
};
