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

/**
 * Utility classes related to graph display.
 */
export default class TextUtil {
  /**
   * Escape the graph text.
   * @param before  Graph text before escaping.
   * @returns Graph text after escaping.
   */
  public static escapeSpecialCharacters(before: string): string {
    return before
      .split("<br/>")
      .map((line) => {
        // Since it is difficult to escape, change #,; to ##, ;;
        const preConvertedLine = line.replace(/#/g, "##").replace(/;/g, ";;");

        return (
          preConvertedLine
            .replace(/;;/g, "#59;") // Escape of; (Be sure to replace first because;
            // after conversion of numerical character reference is affected)
            .replace(/##/g, "#35;") // # Escape
            .replace(/&/g, "#38;") // & Escape
            .replace(/</g, "#60;") // < Escape
            .replace(/>/g, "#62;") // > Escape
            .replace(/"/g, "#34;") // " Escape
            .replace(/'/g, "#39;") // ' Escape
        );
      })
      .join("<br/>");
  }

  /**
   * Omit the character string. Add "..." to the end of the word.
   * @param before  Character string to omit.
   * @param length  Number of characters you want to omit.
   * @returns Character string after omission.
   */
  public static ellipsis(before: string, length: number): string {
    return before.length > length ? `${before.slice(0, length)}...` : before;
  }

  /**
   * Convert line breaks to half-width spaces.
   * @param before  Character string before conversion.
   * @returns Converted string.
   */
  public static toSingleLine(before: string): string {
    return before.replace(/\r?\n/g, " ");
  }

  /**
   * Returns a string with a newline (<br />) at the specified length.
   * @param before  Character string before line break.
   * @param lineLength  Number of characters you want to start a new line.
   * @returns Character string after line break.
   */
  public static lineBreak(before: string, lineLength: number): string {
    const lines: string[] = [];
    let curLength = 0;
    let line = "";
    for (let i = 0; i < before.length; i++) {
      const charCode = before.charCodeAt(i);
      const charLen = this.isOneByte(charCode) ? 1 : 2;
      curLength += charLen;
      if (lineLength < curLength) {
        lines.push(line);
        line = "";
        curLength = charLen;
      }
      line += before.charAt(i);
    }
    lines.push(line);
    return lines.join("<br/>");
  }

  private static isOneByte(charCode: number): boolean {
    return (
      (charCode >= 0x00 && charCode < 0x81) ||
      charCode === 0xf8f0 ||
      (charCode >= 0xff61 && charCode < 0xffa0) ||
      (charCode >= 0xf8f1 && charCode < 0xf8f4)
    );
  }
}
