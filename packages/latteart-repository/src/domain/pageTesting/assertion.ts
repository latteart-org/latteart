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

import Pixelmatch from "pixelmatch";
import { Image } from "../types";
import { PageAssertionResult, PageAssertionOption, PageState } from "./types";

export async function assertPageStateEqual(
  pageStates: { actual?: PageState; expected?: PageState },
  option: PageAssertionOption = {}
): Promise<PageAssertionResult> {
  const title = option?.excludeItems?.includes("title")
    ? undefined
    : compareTexts({
        actual: pageStates.actual?.title,
        expected: pageStates.expected?.title,
      });
  const url = option?.excludeItems?.includes("url")
    ? undefined
    : compareTexts({
        actual: pageStates.actual?.url,
        expected: pageStates.expected?.url,
      });
  const elementTexts = option?.excludeItems?.includes("elementTexts")
    ? undefined
    : compareElementTexts(
        {
          actual: pageStates.actual?.elementTexts,
          expected: pageStates.expected?.elementTexts,
        },
        option
      );
  const screenshot = option?.excludeItems?.includes("screenshot")
    ? undefined
    : await compareScreenshots({
        actual: pageStates.actual?.screenshot,
        expected: pageStates.expected?.screenshot,
      });

  const items = {
    title,
    url,
    elementTexts,
    screenshot: screenshot
      ? {
          isOk: screenshot.isOk,
          actual: screenshot.actual,
          expected: screenshot.expected,
          diff: screenshot.diff,
        }
      : undefined,
  };

  return {
    isOk: Object.values(items).every((detail) => detail?.isOk ?? true),
    items,
    errors: screenshot?.error ? [screenshot.error] : undefined,
  };
}

function compareTexts(texts: { actual?: string; expected?: string }) {
  const isOk = texts.actual === texts.expected;

  return { isOk, actual: texts.actual, expected: texts.expected };
}

function compareElementTexts(
  elementTexts: {
    actual?: PageState["elementTexts"];
    expected?: PageState["elementTexts"];
  },
  option?: PageAssertionOption
) {
  const excludeTags = (elements: PageState["elementTexts"]) => {
    return elements.filter((element) => {
      return !(option?.excludeElements ?? [])
        .map((element) => element.tagname.toLowerCase())
        .includes(element.tagname.toLowerCase());
    });
  };

  const isOk =
    (elementTexts.actual
      ? JSON.stringify(excludeTags(elementTexts.actual))
      : undefined) ===
    (elementTexts.expected
      ? JSON.stringify(excludeTags(elementTexts.expected))
      : undefined);

  return { isOk, actual: elementTexts.actual, expected: elementTexts.expected };
}

async function compareScreenshots(screenshots: {
  actual?: PageState["screenshot"];
  expected?: PageState["screenshot"];
}) {
  if (!screenshots.actual && !screenshots.expected) {
    return {
      isOk: true,
      actual: screenshots.actual,
      expected: screenshots.expected,
    };
  }

  if (!screenshots.actual || !screenshots.expected) {
    return {
      isOk: false,
      actual: screenshots.actual,
      expected: screenshots.expected,
    };
  }

  try {
    const diffImageData = extractImageDiff(
      await screenshots.actual.read(),
      await screenshots.expected.read()
    );

    return {
      isOk: !diffImageData,
      actual: screenshots.actual,
      expected: screenshots.expected,
      diff: diffImageData,
    };
  } catch (error) {
    return {
      isOk: false,
      actual: screenshots.actual,
      expected: screenshots.expected,
      error: "invalid_screenshot" as const,
    };
  }
}

function extractImageDiff(actual: Image, expected: Image): Image | undefined {
  const diffImageData = Buffer.alloc(actual.data.length);

  const numDiffPixels = Pixelmatch(
    actual.data,
    expected.data,
    diffImageData,
    actual.width,
    actual.height,
    { threshold: 0 }
  );

  if (numDiffPixels === 0) {
    return;
  }

  return {
    width: actual.width,
    height: actual.height,
    data: diffImageData,
  };
}
