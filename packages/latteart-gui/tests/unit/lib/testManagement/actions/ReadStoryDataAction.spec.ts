import { RESTClient, RESTClientResponse } from "latteart-client";
import { TestResultRepository, StoryRepository } from "latteart-client";
import { ReadStoryDataAction } from "@/lib/testManagement/actions/ReadStoryDataAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
};

describe("ReadStoryDataActionの", () => {
  describe("#readStory", () => {
    describe("ストーリー情報をリポジトリから読み込む", () => {
      it("ストーリー情報の取得に成功した場合", async () => {
        const expectedStory = {
          id: "storyId",
          index: 0,
          testMatrixId: "testMatrixId",
          testTargetId: "testTargetId",
          viewPointId: "viewPointId",
          status: "ng",
          sessions: [],
        };
        const getStoryResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedStory,
        };
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(getStoryResSuccess),
        };
        const action = new ReadStoryDataAction({
          testResultRepository: new TestResultRepository(restClient),
          storyRepository: new StoryRepository(restClient),
          serviceUrl: "serviceUrl",
        });

        const result = await action.readStory({ id: "storyId" });

        expect(restClient.httpGet).toBeCalledWith(
          `api/v1/stories/${expectedStory.id}`
        );

        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedStory);
        } else {
          throw new Error("failed");
        }
      });

      it("ストーリー情報の取得に失敗した場合", async () => {
        const resFailure: RESTClientResponse = {
          status: 500,
          data: { code: "errorcode", message: "errormessage" },
        };
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(resFailure),
        };
        const action = new ReadStoryDataAction({
          testResultRepository: new TestResultRepository(restClient),
          storyRepository: new StoryRepository(restClient),
          serviceUrl: "serviceUrl",
        });

        const storyId = "storyId";

        const result = await action.readStory({ id: storyId });

        expect(restClient.httpGet).toBeCalledWith(`api/v1/stories/${storyId}`);

        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.test_management.read_story_data_failed",
          });
        }
      });
    });
  });
});
