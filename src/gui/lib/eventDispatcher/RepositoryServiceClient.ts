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

import { RESTClient, RESTClientResponse } from "./RESTClient";

export class RepositoryServiceClient implements RESTClient {
  constructor(private restClient: RESTClient, private _serviceUrl: string) {}

  /**
   * Service URL.
   */
  get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * Make a GET request.
   * @param url
   */
  public async httpGet(url: string): Promise<RESTClientResponse> {
    const apiUrl = this.buildAPIURL(url, this._serviceUrl);
    return this.restClient.httpGet(apiUrl);
  }

  /**
   * Make a POST request.
   * @param url
   * @param body
   */
  public async httpPost<T>(url: string, body?: T): Promise<RESTClientResponse> {
    const apiUrl = this.buildAPIURL(url, this._serviceUrl);
    return this.restClient.httpPost(apiUrl, body);
  }

  /**
   * Make a PUT request.
   * @param url
   * @param body
   */
  public async httpPut<T>(url: string, body: T): Promise<RESTClientResponse> {
    const apiUrl = this.buildAPIURL(url, this._serviceUrl);
    return this.restClient.httpPut(apiUrl, body);
  }

  /**
   * Make a PATCH request.
   * @param url
   * @param body
   */
  public async httpPatch<T>(url: string, body: T): Promise<RESTClientResponse> {
    const apiUrl = this.buildAPIURL(url, this._serviceUrl);
    return this.restClient.httpPatch(apiUrl, body);
  }

  /**
   * Make a DELETE request.
   * @param url
   */
  public async httpDelete(url: string): Promise<RESTClientResponse> {
    const apiUrl = this.buildAPIURL(url, this._serviceUrl);
    return this.restClient.httpDelete(apiUrl);
  }

  private buildAPIURL(url: string, serviceUrl: string) {
    return new URL(`api/v1${url}`, serviceUrl).toString();
  }
}
