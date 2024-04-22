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

import * as d3 from "d3";
import type MermaidGraphExtender from "./MermaidGraphExtender";

/**
 * A class that extends Mermaid's flowchart
 */
export default class FlowChartGraphExtender implements MermaidGraphExtender {
  private callback: {
    onClickEdge: (edgeIndex: number) => void;
    onClickScreenRect: (screenRectIndex: number) => void;
  };
  private nameMap: Map<string, string>;
  private registeredEventElementList: Array<{
    eventName: string;
    element: d3.Selection<d3.BaseType, unknown, null, undefined>;
  }> = [];

  /**
   * Constructor.
   * @param args.callback  Callback function.
   * @param args.nameMap  Map that links index and screen name.
   */
  constructor(args: {
    callback: {
      onClickEdge: (edgeIndex: number) => void;
      onClickScreenRect: (screenRectIndex: number) => void;
    };
    nameMap: Map<string, string>;
  }) {
    this.callback = args.callback;
    this.nameMap = args.nameMap;
  }

  /**
   * Clear the bound callback function.
   */
  public clearEvent(): void {
    this.registeredEventElementList.forEach((item) => {
      item.element.on(item.eventName, null);
    });
    this.callback = {
      onClickEdge: () => {
        /* Do nothing */
      },
      onClickScreenRect: () => {
        /* Do nothing */
      }
    };
  }

  /**
   * Extend the graph.
   * Bind callback functions to elements and change the color of elements.
   * @param element  Svg element to draw the graph.
   */
  public extendGraph(element: Element): void {
    const svg = d3.select(element as d3.BaseType);

    // Omitted if the display name of the element is long.
    svg.selectAll("g.node").each((_, i, nodes) => {
      const id = (nodes[i] as HTMLElement).getAttribute("id");
      // In SVG the id is set as flowchart-{screenId}-xx(flowchart-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xx)
      // so extract the screenId as a substring.
      const fullText = this.nameMap.get(id!.substring(10, 46));
      const g = d3.select(nodes[i] as Node as d3.BaseType);
      g.append("svg:title").text(fullText ? fullText : "");
    });

    // When pressing the character string attached to Edge.
    svg.selectAll("g.edgeLabel").each((_, i, nodes) => {
      const edgeArea = d3.select(nodes[i] as Node as d3.BaseType);
      this.registeredEventElementList.push({
        eventName: "click",
        element: edgeArea
      });
      edgeArea.on("click", () => {
        this.callback.onClickEdge(i);
      });
    });

    // (Screen) When a node is pressed.
    svg.selectAll("g>.node").each((_, i, nodes) => {
      const rectArea = d3.select(nodes[i] as Node as d3.BaseType);
      this.registeredEventElementList.push({
        eventName: "click",
        element: rectArea
      });
      rectArea.on("click", () => {
        this.callback.onClickScreenRect(i);
      });
    });
  }
}
