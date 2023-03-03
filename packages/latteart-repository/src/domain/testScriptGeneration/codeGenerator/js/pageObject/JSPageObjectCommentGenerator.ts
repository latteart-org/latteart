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

import { ScreenTransitionDiagram } from "../../../docGenerator";
import { PageObjectCommentGenerator } from "../../types";

export class JSPageObjectCommentGenerator
  implements PageObjectCommentGenerator
{
  public generateFrom(
    name: string,
    description: string,
    imageUrl: string,
    diagram: ScreenTransitionDiagram
  ): string {
    return `\
@class ${name}
@description ${description}
@mermaid
${diagram.toString()}`;
  }
}
