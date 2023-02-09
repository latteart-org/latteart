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

enum Browser {
  Chrome = "Chrome",
  Safari = "Safari",
  Edge = "Edge",
}

enum PlatformName {
  PC = "PC",
  Android = "Android",
  iOS = "iOS",
}

enum ScreenDefType {
  Title = "title",
  Url = "url",
}

/**
 * Tool execution mode
 */
enum RunningMode {
  Production = "production",
  Debug = "debug",
}

enum Locale {
  Ja = "ja",
  En = "en",
}

export { Browser, PlatformName, ScreenDefType, RunningMode, Locale };
