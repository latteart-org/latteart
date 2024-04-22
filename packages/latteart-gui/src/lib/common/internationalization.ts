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

export type I18nProvider = {
  /**
   * Build and get a message that matches the locale with message key and arguments.
   * @param messageKey message key.
   * @param args arguments.
   * @returns Built message.
   */
  message(messageKey: string, args?: { [name: string]: string }): string;

  /**
   * Get current locale.
   * @returns Locale.
   */
  getLocale(): "ja" | "en";

  /**
   * Set locale.
   * @param locale locale.
   */
  setLocale(locale: "ja" | "en"): void;
};
