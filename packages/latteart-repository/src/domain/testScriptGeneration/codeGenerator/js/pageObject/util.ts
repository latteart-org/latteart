import { Locator } from "@/domain/elementLocator";

export const generateFindElementMultiAccessorString = (
  identifier: string,
  locators: Locator[],
  iframeIndex?: number
): string => {
  return `get ${identifier}() {
  ${generateSwitchFrameString(
    `driver.findElementMulti(
      ${locators.map((locator) => JSON.stringify(locator)).join(",\n      ")}
    )`,
    iframeIndex
  )}
  }`;
};

export const generateAccessorString = (
  identifier: string,
  locators: Locator[],
  iframeIndex?: number
): string => {
  return `get ${identifier}() {
  ${generateSwitchFrameString(`$('${locators[0].other}')`, iframeIndex)}
}`;
};

export const generateSwitchFrameString = (
  getLocator: string,
  iframeIndex?: number
): string => {
  return iframeIndex !== undefined
    ? `return driver
    .switchToFrame(null)
    .then(async () => driver.switchToFrame(${iframeIndex}))
    .then(async () => ${getLocator});`
    : `return driver
    .switchToFrame(null)
    .then(async () => ${getLocator});`;
};
