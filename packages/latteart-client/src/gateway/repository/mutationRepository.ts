import { ScreenMutation } from "@/service";
import {
  RepositoryAccessResult,
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
  createRepositoryAccessSuccess,
} from "./result";
import { RESTClient } from "@/network/http/client";

export interface MutationRepository {
  postMutation(
    testResultId: string,
    mutations: ScreenMutation[]
  ): Promise<RepositoryAccessResult<void>>;
}

export class MutationRepositoryImpl implements MutationRepository {
  constructor(private restClient: RESTClient) {}

  public async postMutation(
    testResultId: string,
    mutations: ScreenMutation[]
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/mutations`,
        mutations
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({ data: undefined as void });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
