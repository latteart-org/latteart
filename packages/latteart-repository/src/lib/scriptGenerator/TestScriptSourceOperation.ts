/**
 * Element for test script generation.
 */
export interface TestScriptSourceElement {
  locator: string;
  tagname: string;
  text?: string;
  xpath: string;
  attributes: { [key: string]: any };
}

/**
 * Operation for test script generation.
 */
export interface TestScriptSourceOperation {
  /**
   * Input value.
   */
  input: string;
  /**
   * Operation type.
   */
  type: string;
  /**
   * Element information to be operated.
   */
  elementInfo: TestScriptSourceElement | null;
  /**
   * URL to be operated.
   */
  url: string;
  /**
   * Screen definition.
   */
  screenDef: string;
  /**
   * Screen image path.
   */
  imageFilePath: string;
}
