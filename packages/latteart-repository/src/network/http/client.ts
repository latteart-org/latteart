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

import { ProxyAgent, fetch } from "undici";
import { HttpClient, HttpRequestInit } from "./types";

/**
 * Create HTTP client.
 * @returns HTTP client.
 */
export function createHttpClient(): HttpClient {
  const proxy = process.env.HTTP_PROXY;
  const option = proxy ? { proxy } : undefined;

  return new HttpClientImpl(option);
}

/**
 * HTTP client.
 */
export class HttpClientImpl implements HttpClient {
  constructor(private readonly option?: { proxy?: string }) {}

  async send(url: string, init: HttpRequestInit) {
    const baseInit = this.option?.proxy
      ? { dispatcher: new ProxyAgent(this.option.proxy) }
      : {};

    console.debug(`fetch: ${url}`);

    const res = await fetch(url, {
      ...baseInit,
      ...init,
    });

    return {
      ok: res.ok,
      status: res.status,
      text: () => res.text(),
      json: () => res.json(),
      blob: () => res.blob(),
    };
  }
}
