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

import WebDriverClient from "@/webdriver/WebDriverClient";

/**
 * Bounding Rect.
 */
export interface BoundingRect {
  /**
   * Top.
   */
  top: number;

  /**
   * Left.
   */
  left: number;

  /**
   * Width.
   */
  width: number;

  /**
   * Height.
   */
  height: number;
}

/**
 * The class for taking screenshots with mark.
 */
export default class MarkedScreenShotTaker {
  private static MARKED_RECT_ID_PREFIX = "__LATTEART_MARKED_RECT__";

  private client: WebDriverClient;

  /**
   * Constructor.
   * @param client The WebDriver client to take screenshots.
   */
  constructor(client: WebDriverClient) {
    this.client = client;
  }

  /**
   * Take a screenshot with mark of bounding rects.
   * @param rects Bounding rects.
   * @returns Taken screenshot.(base64)
   */
  public async takeScreenshotWithMarkOf(
    rects: BoundingRect[]
  ): Promise<string> {
    await this.markElements(rects);
    const screenShotBase64 = await this.client.takeScreenshot();
    await this.unmarkElements(rects);

    return screenShotBase64;
  }

  private async markElements(rects: BoundingRect[]): Promise<void> {
    await Promise.all(
      rects.map(async (rect, index) => {
        await this.markRect(rect, index);

        if (rects.length > 1) {
          await this.putNumberToRect(index);
        }
      })
    );
  }

  private async unmarkElements(rects: BoundingRect[]): Promise<void> {
    await this.client.execute(
      ({ rects, prefix }) => {
        rects.forEach((_, index) => {
          const element = document.getElementById(`${prefix}_${index}`);
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
      },
      { rects, prefix: MarkedScreenShotTaker.MARKED_RECT_ID_PREFIX }
    );
  }

  private async markRect(rect: BoundingRect, index: number): Promise<void> {
    await this.client.execute(
      ({ rect, index, prefix }) => {
        const div = document.createElement("div");

        div.id = `${prefix}_${index}`;
        div.style.position = "absolute";
        (div.style.top = rect.top + window.pageYOffset + "px"),
          // div.style.top = rect.top - ${this.getTopElementMarginTopFunc}() + window.pageYOffset + 'px',
          (div.style.left = rect.left + window.pageXOffset + "px"),
          (div.style.height = rect.height + "px");
        div.style.width = rect.width + "px";
        div.style.border = "2px solid #F00";
        div.style.display = "block";
        div.style.zIndex = "2147483647";
        div.style.pointerEvents = "none";

        const body = document.getElementsByTagName("body")[0];
        body.insertAdjacentElement("beforeend", div);
      },
      { rect, index, prefix: MarkedScreenShotTaker.MARKED_RECT_ID_PREFIX }
    );
  }

  private async putNumberToRect(index: number): Promise<void> {
    await this.client.execute(
      ({ index, prefix }) => {
        const div = document.getElementById(`${prefix}_${index}`);

        if (div === null) {
          return;
        }

        const p = document.createElement("p");
        p.style.position = "relative";
        p.style.top = "0px";
        p.style.left = "0px";
        p.style.color = "red";
        const vhShadow =
          "0px 1px 0px white, 0px -1px 0px white, -1px 0px 0px white, 1px 0px 0px white";
        const diagonalShadow =
          "1px 1px 0px white, -1px -1px 0px white, -1px 1px 0px white, 1px -1px 0px white";
        p.style.textShadow = vhShadow + ", " + diagonalShadow;
        p.innerText = String.fromCharCode(9312 + index);

        div.insertAdjacentElement("beforeend", p);
      },
      { index, prefix: MarkedScreenShotTaker.MARKED_RECT_ID_PREFIX }
    );
  }
}
