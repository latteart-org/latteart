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

/**
 * HTTP client response.
 */
export type HttpClientResponse = {
  /**
   * Request was successful or not.
   */
  ok: boolean;
  /**
   * Status code.
   */
  status: number;
  /**
   * Get data as text.
   * @returns
   */
  text: () => Promise<string>;
  /**
   * Get data as json.
   * @returns
   */
  json: () => Promise<unknown>;
  /**
   * Get data as blob.
   * @returns
   */
  blob: () => Promise<Blob>;
};

/**
 * HTTP client init.
 */
export type HttpRequestInit = {
  /**
   * Method.
   */
  method: string;
  /**
   * Headers.
   */
  headers: Record<string, string>;
  /**
   * Body.
   */
  body: string;
};

/**
 * HTTP client.
 */
export type HttpClient = {
  /**
   * Send HTTP request.
   * @param url Url.
   * @param init Request init.
   */
  send(url: string, init: HttpRequestInit): Promise<HttpClientResponse>;
};
