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
