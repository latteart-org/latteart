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

import { RESTClientResponse } from "../eventDispatcher/RESTClient";

/**
 * Response from the counter device.
 */
export interface Reply<T> {
  readonly status: number;
  readonly succeeded: boolean;
  readonly data?: T;
  readonly error?: ServerError;
}

export class ReplyImpl<T> implements Reply<T> {
  constructor(
    private body: { status: number; data?: T; error?: ServerError }
  ) {}

  public get status(): number {
    return this.body.status;
  }

  public get succeeded(): boolean {
    return !this.body.error;
  }

  public get data(): T | undefined {
    return this.body.data;
  }

  public get error(): ServerError | undefined {
    return this.body.error;
  }
}

export type RepositoryAccessResult<T> =
  | RepositoryAccessSuccess<T>
  | RepositoryAccessFailure;

export class RepositoryAccessSuccess<T> {
  constructor(private readonly body: { status: number; data: T }) {}

  public get status(): number {
    return this.body.status;
  }

  public get data(): T {
    return this.body.data;
  }

  public isSuccess(): this is RepositoryAccessSuccess<T> {
    return true;
  }

  public isFailure(): this is RepositoryAccessFailure {
    return false;
  }
}

export class RepositoryAccessFailure {
  constructor(private readonly body: { status: number; error: ServerError }) {}

  public get status(): number {
    return this.body.status;
  }

  public get error(): ServerError {
    return this.body.error;
  }

  public isSuccess(): this is RepositoryAccessSuccess<unknown> {
    return false;
  }

  public isFailure(): this is RepositoryAccessFailure {
    return true;
  }
}

/**
 * Server error information.
 */
export interface ServerError {
  code: string;
  message?: string;
  details?: Array<{
    code: string;
    message: string;
    target: string;
  }>;
}

export function createRepositoryAccessFailure(
  response: RESTClientResponse
): RepositoryAccessFailure {
  if (isServerError(response.data)) {
    return new RepositoryAccessFailure({
      status: response.status,
      error: response.data,
    });
  } else {
    console.error("Invalid Server Error.", response.data);

    return new RepositoryAccessFailure({
      status: response.status,
      error: { code: "unknown_error" },
    });
  }
}

function isServerError(data: unknown): data is ServerError {
  if (typeof data !== "object") {
    return false;
  }

  if (typeof (data as ServerError).code !== "string") {
    return false;
  }

  const message = (data as ServerError).message;
  if (message !== undefined) {
    if (typeof (data as ServerError).message !== "string") {
      return false;
    }
  }

  const details = (data as ServerError).details;

  if (details !== undefined) {
    if (typeof details !== "object") {
      return false;
    }

    if (
      !details.every((detail) => {
        return (
          typeof detail.code === "string" &&
          typeof detail.message === "string" &&
          typeof detail.target === "string"
        );
      })
    ) {
      return false;
    }
  }

  return true;
}
