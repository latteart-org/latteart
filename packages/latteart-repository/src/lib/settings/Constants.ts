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

/** Error message */
export const ERR_MSG = {
  /** When reading the configuration file */
  SETTINGS: {
    INVALID_SCREEN_DEF_TYPE:
      "latteart.config.json read error: Invalid screenDefType. Allowed values are title or url. The value setting is",
    INVALID_LOCALE:
      "latteart.config.json read error: Invalid locale. Allowed values are ja or en. The value setting is",
    INVALID_MODE:
      "latteart.config.json read error: Invalid mode. Allowed values are production or debug. The value setting is",
  },
};
