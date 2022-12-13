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

import { CaptureCLServiceErrorCode } from "./captureClService";
import { RepositoryServiceErrorCode } from "./repositoryService";

/**
 * service error
 */
export type ServiceError = {
  errorCode:
    | RepositoryServiceErrorCode
    | CaptureCLServiceErrorCode
    | "unknown_error";
  message: string;
  variables?: { [key: string]: string };
};

/**
 * service result
 */
export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

/**
 * service result contains the success value
 */
export class ServiceSuccess<T> {
  constructor(public readonly data: T) {}

  public isSuccess(): this is ServiceSuccess<T> {
    return true;
  }

  public isFailure(): this is ServiceFailure {
    return false;
  }
}

/**
 * service result contains the error value
 */
export class ServiceFailure {
  constructor(public readonly error: ServiceError) {}

  public isSuccess(): this is ServiceSuccess<unknown> {
    return false;
  }

  public isFailure(): this is ServiceFailure {
    return true;
  }
}
