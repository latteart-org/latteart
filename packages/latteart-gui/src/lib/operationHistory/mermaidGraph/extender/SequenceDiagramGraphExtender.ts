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
 * A class that extends the mermaid sequence diagram.
 */
export default class SequenceDiagramGraphExtender implements MermaidGraphExtender {
  private callback: {
    onClickActivationBox: (index: number) => void;
    onClickEdge: (index: number) => void;
    onClickScreenRect: (index: number) => void;
    onClickNote: (index: number) => void;
    onRightClickNote: (index: number, eventInfo: { clientX: number; clientY: number }) => void;
    onRightClickLoopArea: (index: number, eventInfo: { clientX: number; clientY: number }) => void;
  };
  private tooltipTextsOfNote: string[];
  private tooltipTextsOfLoopArea: string[];
  private nameMap: Map<number, string>;

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
      onClickActivationBox: (index: number) => void;
      onClickEdge: (index: number) => void;
      onClickScreenRect: (index: number) => void;
      onClickNote: (index: number) => void;
      onRightClickNote: (index: number, eventInfo: { clientX: number; clientY: number }) => void;
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
    this.callback = {
      onClickActivationBox: () => {
        /* Do nothing. */
      },
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
      }
    };
  }

  /**
   * Extend the graph.
   * Bind a callback function to an element, change the color of the element, etc.
   * @param element  Svg element to draw the graph.
   */
  public extendGraph(element: Element, disabledNodeIndexes: number[] = []): void {
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
      const messageText = d3.select(nodes[i] as Node as d3.BaseType);

      if (disabledNodeIndexes.includes(i)) {
        messageText.classed("disabled", true);
      } else {
        messageText.on("click", () => {
          this.callback.onClickEdge(i);
        });
      }
    });

    svg.selectAll(".messageLine0,.messageLine1").each((_, i, nodes) => {
      const messageLine = d3.select(nodes[i] as Node as d3.BaseType);

      if (disabledNodeIndexes.slice(0, -1).includes(i)) {
        messageLine.classed("disabled", true);
      }
    });

    // When pressing activation box.
    svg.selectAll("g>rect.activation0").each((_, i, nodes) => {
      const activationBoxArea = d3.select((nodes[i] as Node).parentNode as d3.BaseType);

      if (disabledNodeIndexes.includes(i)) {
        activationBoxArea.select("rect").classed("disabled", true);
      } else {
        activationBoxArea.on("click", () => {
          this.callback.onClickActivationBox(i);
        });
      }
    });

    // When pressing the opt string.
    svg
      .selectAll("text.labelText")
      .filter((_, i, nodes) => {
        return (nodes[i] as Node).textContent === "opt";
      })
      .each((_, i, nodes) => {
        const loopTexts = d3
          .select((nodes[i] as Node).parentNode as d3.BaseType)
          .selectAll("text.loopText");

        if (this.tooltipTextsOfLoopArea.length > i) {
          loopTexts.append("svg:title").text(this.tooltipTextsOfLoopArea[i]);
        }

        loopTexts.on("contextmenu", (event: MouseEvent) => {
          this.callback.onRightClickLoopArea(i, {
            clientX: event.clientX,
            clientY: event.clientY
          });
        });
        loopTexts.select("tspan").style("fill", "black").style("font-weight", null);

        loopTexts.on("mouseover", () => {
          loopTexts.select("tspan").style("fill", "red").style("font-weight", "bold");
        });
        loopTexts.on("mouseout", () => {
          loopTexts.select("tspan").style("fill", "black").style("font-weight", null);
        });

        const loopLines = d3
          .select((nodes[i] as Node).parentNode as d3.BaseType)
          .selectAll("line.loopLine");

        loopLines.style("stroke-dasharray", 0).style("stroke-width", 2);
      });

    // When pressing the opt string.
    svg
      .selectAll("text.labelText")
      .filter((_, i, nodes) => {
        return (nodes[i] as Node).textContent === "opt";
      })
      .each((_, i, nodes) => {
        const loopTexts = d3
          .select((nodes[i] as Node).parentNode as d3.BaseType)
          .selectAll("text.loopText");

        loopTexts.select("tspan").style("fill", "rgb(155 153 153)").style("font-weight", null);
      });

    // (Screen) When pressing the lifeline.
    svg.selectAll("g>rect.actor").each((_, i, nodes) => {
      const targetRectElement = d3.select((nodes[i] as Node).parentNode as d3.BaseType);

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

      g.on("click", () => {
        this.callback.onClickNote(i);
      });

      g.on("contextmenu", (event: MouseEvent) => {
        this.callback.onRightClickNote(i, {
          clientX: event.clientX,
          clientY: event.clientY
        });
      });
    });
  }
}
