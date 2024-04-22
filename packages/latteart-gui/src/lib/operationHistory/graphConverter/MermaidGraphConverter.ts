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

import Mermaid from "mermaid";

/**
 * A class that performs conversions related to Mermaid's graph display.
 */
export default class MermaidGraphConverter {
  /**
   * constructor
   * @param theme
   */
  constructor(theme: "default" | "forest" | "dark" | "neutral" = "default") {
    Mermaid.mermaidAPI.initialize({
      startOnLoad: true,
      theme,
      fontSize: undefined
    });
  }

  /**
   * Convert graph text to SVG format.
   * @param svgId  svg ID.
   * @param graphText  Graph text to convert.
   * @returns svg
   */
  public toSVG(svgId: string, graphText: string): string {
    // Create a container applied a 'font-family' before rendering.
    const container = document.createElement("div");
    container.style.fontFamily = '"trebuchet ms", verdana, arial';
    document.body.insertAdjacentElement("beforeend", container);

    const svg = Mermaid.render(
      svgId,
      graphText,
      () => {
        /* Do nothing */
      },
      container as any
    );
    container.remove();
    return svg;
  }
}
