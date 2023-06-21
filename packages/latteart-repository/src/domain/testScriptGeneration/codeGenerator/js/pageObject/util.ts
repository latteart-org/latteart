import { Locator } from "@/domain/elementLocator";

export const generateFindElementMultiAccessorString = (
  identifier: string,
  locators: Locator[]
): string => {
  return `get ${identifier}() {
  return driver.findElementMulti(
    ${locators.map((locator) => JSON.stringify(locator)).join(",\n      ")}
  )
}`;
};

export const generateAccessorString = (
  identifier: string,
  locator: Locator[]
): string => {
  return `get ${identifier}() { return $('${locator[0].other}'); }`;
};
