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

import { BoundingRect } from "@/captureScripts/types";
import { CDPClient } from "./types";
import { captureScripts } from "@/captureScripts/cdp";

/**
 * The class for taking screenshots with mark.
 */
export default class CDPMarkedScreenShotTaker {
  private static MARKED_RECT_ID_PREFIX = "__LATTEART_MARKED_RECT__";

  /**
   * Constructor.
   * @param client The CDP client to take screenshots.
   * @param options Options for taking screenshots.
   */
  constructor(
    private client: CDPClient,
    private options: { type?: "png" | "webp" } = {}
  ) {}

  /**
   * Take a screenshot with mark of bounding rects.
   * @param rects Bounding rects.
   * @returns Taken screenshot.(base64)
   */
  public async takeScreenshotWithMarkOf(
    target: { pageId: string; iframeIndex?: number },
    rects: BoundingRect[],
    fullPage?: boolean
  ): Promise<string> {
    await this.markElements(target, rects);
    const screenShotBase64 = await this.client.screenshot(target.pageId, {
      type: this.options.type ?? "png",
      fullPage: fullPage ?? false,
    });
    await this.unmarkElements(target, rects);

    return screenShotBase64;
  }

  private async markElements(
    target: { pageId: string; iframeIndex?: number },
    rects: BoundingRect[]
  ): Promise<void> {
    await Promise.all(
      rects.map(async (rect, index) => {
        await this.markRect(target, rect, index);

        if (rects.length > 1) {
          await this.putNumberToRect(target, index);
        }
      })
    );
  }

  private async unmarkElements(
    target: { pageId: string; iframeIndex?: number },
    rects: BoundingRect[]
  ): Promise<void> {
    await this.client.executeScript(target, captureScripts.unmarkElements, {
      rects,
      prefix: CDPMarkedScreenShotTaker.MARKED_RECT_ID_PREFIX,
    });
  }

  private async markRect(
    target: { pageId: string; iframeIndex?: number },
    rect: BoundingRect,
    index: number
  ): Promise<void> {
    await this.client.executeScript(target, captureScripts.markElement, {
      rect,
      index,
      prefix: CDPMarkedScreenShotTaker.MARKED_RECT_ID_PREFIX,
    });
  }

  private async putNumberToRect(
    target: { pageId: string; iframeIndex?: number },
    index: number
  ): Promise<void> {
    await this.client.executeScript(target, captureScripts.putNumberToRect, {
      index,
      prefix: CDPMarkedScreenShotTaker.MARKED_RECT_ID_PREFIX,
    });
  }
}
