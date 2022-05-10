export interface ActionResult<T> {
  readonly data?: T;
  readonly error?: ActionError;
}

/**
 * Action error information.
 */
export interface ActionError {
  code: string;
}
