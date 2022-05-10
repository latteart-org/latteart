import RESTClient from "../RESTClient";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";

export class ImportProjectRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Get a list of projects for import.
   * @returns List of projects for import.
   */
  public async getProjects(): Promise<
    Reply<Array<{ url: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/imports/projects`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Array<{
        url: string;
        name: string;
      }>,
    });
  }
}
