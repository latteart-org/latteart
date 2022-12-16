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

import { ElementInfo } from "src/common";

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
 * Load file as base64.
 * @param targetFile target file.
 * @returns base64 data and filename.
 */
export const loadFileAsBase64 = (
  targetFile: File
): Promise<{ data: string; name: string }> => {
  return new Promise<{ data: string; name: string }>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result ? reader.result.toString() : "";
      const keyword = "base64,";
      const data = result.substring(result.indexOf(keyword) + keyword.length);

      resolve({ data, name: targetFile.name });
    };

    reader.readAsDataURL(targetFile);
  });
};

/**
 * Load file as text.
 * @param targetFile  target file.
 */
export const loadFileAsText = (targetFile: File): Promise<string> => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsText(targetFile);
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
 * Convert the input value of the operation.
 * @param elementInfo  ElementInfo.
 * @param input  Input value.
 * @returns Input value
 */
export const convertInputValue = (
  elementInfo: ElementInfo | null,
  input: string
): string => {
  if (!elementInfo) {
    return "";
  }

  if (
    elementInfo.tagname.toLowerCase() === "input" &&
    !!elementInfo.attributes.type &&
    (elementInfo.attributes.type.toLowerCase() === "checkbox" ||
      elementInfo.attributes.type.toLowerCase() === "radio")
  ) {
    return elementInfo.checked ? "on" : "off";
  }

  return input;
};
