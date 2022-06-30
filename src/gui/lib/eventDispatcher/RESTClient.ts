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

/**
 * A client for communication using the REST API.
 */
export default class RESTClient {
  /**
   * Make a GET request.
   * @param url
   */
  public async httpGet(url: string): Promise<any> {
    console.log(`GET ${url}`);
    const res = await fetch(url, {
      method: "GET",
    });

    if (res.status === 204) {
      return;
    }

    return JSON.parse(await res.text());
  }

  /**
   * Make a POST request.
   * @param url
   * @param body
   */
  public async httpPost<T>(url: string, body?: T): Promise<any> {
    console.log(`POST ${url}`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      cache: "no-cache",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) {
      return;
    }

    return JSON.parse(await res.text());
  }

  /**
   * Make a PUT request.
   * @param url
   * @param body
   */
  public async httpPut<T>(url: string, body: T): Promise<any> {
    console.log(`PUT ${url}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      cache: "no-cache",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status >= 400) {
      throw new Error(
        `Request error. status: ${res.status}, message: ${res.body}`
      );
    }

    if (res.status === 204) {
      return;
    }

    return JSON.parse(await res.text());
  }

  /**
   * Make a PATCH request.
   * @param url
   * @param body
   */
  public async httpPatch<T>(url: string, body: T): Promise<any> {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      cache: "no-cache",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) {
      return;
    }

    return JSON.parse(await res.text());
  }

  /**
   * Make a DELETE request.
   * @param url
   */
  public async httpDelete(url: string): Promise<any> {
    const res = await fetch(url, {
      method: "DELETE",
    });

    if (res.status === 204) {
      return;
    }

    return JSON.parse(await res.text());
  }
}
