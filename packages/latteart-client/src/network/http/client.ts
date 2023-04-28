/**
 * Copyright 2023 NTT Corporation.
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

export interface RESTClientResponse {
  status: number;
  data: unknown;
}

export interface RESTClient {
  readonly serverUrl: string;
  httpGet(url: string): Promise<RESTClientResponse>;
  httpPost<T>(url: string, body?: T): Promise<RESTClientResponse>;
  httpPut<T>(url: string, body: T): Promise<RESTClientResponse>;
  httpPatch<T>(url: string, body: T): Promise<RESTClientResponse>;
  httpDelete(url: string): Promise<RESTClientResponse>;
}

/**
 * A client for communication using the REST API.
 */
export class RESTClientImpl implements RESTClient {
  constructor(public readonly serverUrl: string) {}

  /**
   * Make a GET request.
   * @param url
   */
  public async httpGet(url: string): Promise<RESTClientResponse> {
    return this.httpRequest(url, {
      method: "GET",
    });
  }

  /**
   * Make a POST request.
   * @param url
   * @param body
   */
  public async httpPost<T>(url: string, body?: T): Promise<RESTClientResponse> {
    return this.httpRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      cache: "no-cache",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PUT request.
   * @param url
   * @param body
   */
  public async httpPut<T>(url: string, body: T): Promise<RESTClientResponse> {
    return this.httpRequest(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      cache: "no-cache",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PATCH request.
   * @param url
   * @param body
   */
  public async httpPatch<T>(url: string, body: T): Promise<RESTClientResponse> {
    return this.httpRequest(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      cache: "no-cache",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a DELETE request.
   * @param url
   */
  public async httpDelete(url: string): Promise<RESTClientResponse> {
    return this.httpRequest(url, {
      method: "DELETE",
    });
  }

  private async httpRequest(url: string, init?: RequestInit) {
    const fullUrl = new URL(url, this.serverUrl).toString();

    console.info(`${init?.method} ${fullUrl}`);
    const res = await fetch(fullUrl, init);

    return {
      status: res.status,
      data: res.status === 204 ? undefined : JSON.parse(await res.text()),
    };
  }
}
