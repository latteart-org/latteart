/**
 * Copyright 2021 NTT Corporation.
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
import MermaidGraphExtender from "./MermaidGraphExtender";

/**
 * A class that extends the mermaid sequence diagram.
 */
export default class SequenceDiagramGraphExtender
  implements MermaidGraphExtender {
  private callback: {
    onClickEdge: (index: number) => void;
    onClickScreenRect: (index: number) => void;
    onClickNote: (index: number) => void;
    onRightClickNote: (
      index: number,
      eventInfo: { clientX: number; clientY: number }
    ) => void;
    onRightClickLoopArea: (
      index: number,
      eventInfo: { clientX: number; clientY: number }
    ) => void;
  };
  private tooltipTextsOfNote: string[];
  private tooltipTextsOfLoopArea: string[];
  private nameMap: Map<number, string>;
  private registeredEventElementList: Array<{
    eventName: string;
    element: d3.Selection<d3.BaseType, unknown, null, undefined>;
  }> = [];

  /**
   * Constructor.
   * @param args.callback.onClickEdge  Callback function called when you click Edge.
   * @param args.callback.onClickScreenRect  Callback function called when Rect is clicked.
   * @param args.callback.onClickNote  Callback function called when you click Note.
   * @param args.callback.onRightClickNote  Callback function called when right-clicking on Note.
   * @param args.callback.onRightClickLoopArea  Callback function called when right-clicking on LoopArea.
   * @param args.tooltipTextsOfNote  Tooltip text to display in Note.
   * @param args.tooltipTextsOfLoopArea  Tooltip text to display in Loop Area.
   * @param args.nameMap  Map that links index and screen name.
   */
  constructor(args: {
    callback: {
      onClickEdge: (index: number) => void;
      onClickScreenRect: (index: number) => void;
      onClickNote: (index: number) => void;
      onRightClickNote: (
        index: number,
        eventInfo: { clientX: number; clientY: number }
      ) => void;
      onRightClickLoopArea: (
        index: number,
        eventInfo: { clientX: number; clientY: number }
      ) => void;
    };
    tooltipTextsOfNote: string[];
    tooltipTextsOfLoopArea: string[];
    nameMap: Map<number, string>;
  }) {
    this.callback = args.callback;
    this.tooltipTextsOfNote = args.tooltipTextsOfNote;
    this.tooltipTextsOfLoopArea = args.tooltipTextsOfLoopArea;
    this.nameMap = args.nameMap;
  }

  /**
   * Clear the callback function bound to the graph.
   */
  public clearEvent(): void {
    this.registeredEventElementList.forEach((item) => {
      item.element.on(item.eventName, null);
    });
    this.callback = {
      onClickEdge: () => {
        /* Do nothing. */
      },
      onClickScreenRect: () => {
        /* Do nothing. */
      },
      onClickNote: () => {
        /* Do nothing. */
      },
      onRightClickNote: () => {
        /* Do nothing. */
      },
      onRightClickLoopArea: () => {
        /* Do nothing. */
      },
    };
  }

  /**
   * Extend the graph.
   * Bind a callback function to an element, change the color of the element, etc.
   * @param element  Svg element to draw the graph.
   */
  public extendGraph(element: Element): void {
    const svg = d3.select(element as d3.BaseType);

    // Omitted if the actor display name is long.
    svg.selectAll("g>rect.actor").each((_, i, nodes) => {
      const g = d3.select((nodes[i] as Node).parentNode as d3.BaseType);
      const half = nodes.length / 2;
      const key = half > i ? i : i - half;
      const fullText = this.nameMap.get(Number(key));
      g.append("svg:title").text(fullText ? fullText : "");
    });

    // When pressing edge and accompanying character string.
    svg.selectAll("text.messageText").each((_, i, nodes) => {
      const messageText = d3.select((nodes[i] as Node) as d3.BaseType);

      this.registeredEventElementList.push({
        eventName: "click",
        element: messageText,
      });
      messageText.on("click", () => {
        this.callback.onClickEdge(i);
      });
    });

    // When pressing activation box.
    svg.selectAll("g>rect.activation0").each((_, i, nodes) => {
      const activationBoxArea = d3.select(
        (nodes[i] as Node).parentNode as d3.BaseType
      );
      this.registeredEventElementList.push({
        eventName: "click",
        element: activationBoxArea,
      });
      activationBoxArea.on("click", () => {
        this.callback.onClickEdge(i);
      });
    });

    // When pressing the alt string.
    svg
      .selectAll("text.labelText")
      .filter((_, i, nodes) => {
        return (nodes[i] as Node).textContent === "alt";
      })
      .each((_, i, nodes) => {
        const loopText = d3
          .select((nodes[i] as Node).parentNode as d3.BaseType)
          .select("text.loopText");

        if (this.tooltipTextsOfLoopArea.length > i) {
          loopText.append("svg:title").text(this.tooltipTextsOfLoopArea[i]);
        }

        this.registeredEventElementList.push({
          eventName: "contextmenu",
          element: loopText,
        });
        loopText.on("contextmenu", () => {
          const event = d3.event as MouseEvent;
          this.callback.onRightClickLoopArea(i, {
            clientX: event.clientX,
            clientY: event.clientY,
          });
        });
        loopText.on("mouseover", () => {
          loopText
            .select("tspan")
            .style("fill", "red")
            .style("font-weight", "bold");
        });
        loopText.on("mouseout", () => {
          loopText
            .select("tspan")
            .style("fill", null)
            .style("font-weight", null);
        });
      });

    // (Screen) When pressing the lifeline.
    svg.selectAll("g>rect.actor").each((_, i, nodes) => {
      const targetRectElement = d3.select(
        (nodes[i] as Node).parentNode as d3.BaseType
      );

      this.registeredEventElementList.push({
        eventName: "click",
        element: targetRectElement,
      });
      targetRectElement.on("click", () => {
        const actorIndex = i % (nodes.length / 2);
        this.callback.onClickScreenRect(actorIndex);
      });
    });

    svg.selectAll("g>rect.note").each((_, i, nodes) => {
      const g = d3.select((nodes[i] as Node).parentNode as d3.BaseType);
      const text = g.select("text").text();
      const rect = g.select("rect");
      if (text.includes("DUMMY_COMMENT")) {
        g.style("display", "none");
        // Remove the note class from the dummy note and add a dummy note class so that the click event is not linked to the dummy note.
        rect.attr("class", "dummy_note");
      } else if (text.includes("[bug]")) {
        // Change the color of the bug.
        rect.classed("bug", true);
      }
    });

    // When the balloon is pressed.
    svg.selectAll("g>rect.note").each((_, i, nodes) => {
      const g = d3.select((nodes[i] as Node).parentNode as d3.BaseType);

      if (this.tooltipTextsOfNote.length > i) {
        g.append("svg:title").text(this.tooltipTextsOfNote[i]);
      }

      this.registeredEventElementList.push({
        eventName: "click",
        element: g,
      });
      g.on("click", () => {
        this.callback.onClickNote(i);
      });

      this.registeredEventElementList.push({
        eventName: "contextmenu",
        element: g,
      });
      g.on("contextmenu", () => {
        const event = d3.event as MouseEvent;
        this.callback.onRightClickNote(i, {
          clientX: event.clientX,
          clientY: event.clientY,
        });
      });
    });
  }
}
