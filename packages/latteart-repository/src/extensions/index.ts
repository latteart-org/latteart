/**
 * Copyright 2025 NTT Corporation.
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

import { Router } from "express";
/* ADD IMPORTS FOR EXTENSIONS */

/**
 * Extension.
 */
export type RepositoryExtension = {
  name?: string;
  version?: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  entities: Function[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  migrations: Function[];
  registerRoutes: (app: Router) => void;
};

export const extensions: RepositoryExtension[] = [
  /* ADD EXTENSIONS */
];
