/**
 * Copyright 2024 NTT Corporation.
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

import { BoundingRect, captureScripts } from "@/capturer/captureScripts";
import WebDriverClient from "@/webdriver/WebDriverClient";

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
    await this.client.execute(captureScripts.unmarkElements, {
      rects,
      prefix: MarkedScreenShotTaker.MARKED_RECT_ID_PREFIX,
    });
  }

  private async markRect(rect: BoundingRect, index: number): Promise<void> {
    await this.client.execute(captureScripts.markElement, {
      rect,
      index,
      prefix: MarkedScreenShotTaker.MARKED_RECT_ID_PREFIX,
    });
  }

  private async putNumberToRect(index: number): Promise<void> {
    await this.client.execute(captureScripts.putNumberToRect, {
      index,
      prefix: MarkedScreenShotTaker.MARKED_RECT_ID_PREFIX,
    });
  }
}
