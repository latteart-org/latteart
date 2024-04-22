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

/**
 * Gets the extension of the specified file.
 * Empty string is returned except for jpg, png, gif, webp.
 * @param filePath  Target file path.
 * @returns jpg / png / gif / webp or empty string.
 */
export function getImageExtensionFrom(filePath: string): "jpg" | "png" | "gif" | "webp" | "" {
  const filePathLowerCase = filePath.toLowerCase();
  if (filePathLowerCase.endsWith(".jpg") || filePathLowerCase.endsWith(".jpeg")) {
    return "jpg";
  } else if (filePathLowerCase.endsWith(".png")) {
    return "png";
  } else if (filePathLowerCase.endsWith(".gif")) {
    return "gif";
  } else if (filePathLowerCase.endsWith(".webp")) {
    return "webp";
  }
  return "";
}
