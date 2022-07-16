import { TestTargetGroupRepository } from "@/lib/eventDispatcher/repositoryService/TestTargetGroupRepository";
import { TestTargetRepository } from "@/lib/eventDispatcher/repositoryService/TestTargetRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";
import { DeleteTestTargetAction } from "@/lib/testManagement/actions/DeleteTestTargetAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("DeleteTargetAction", () => {
  describe("#deleteTestTarget", () => {
    it("TestTargetの削除", async () => {
      const testTargetResponse = {
        ...baseRestClient,
        httpDelete: jest.fn().mockResolvedValue({
          status: 204,
        }),
      };

      const testTargetGroupResponse = {
        ...baseRestClient,
        httpGet: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "testTargetGroup",
            name: "testTargetName",
            index: 0,
            testTargets: [],
          },
        }),
      };

      const args = {
        testMatrixId: "testMatrixId",
        groupId: "groupId",
        testTargetId: "testTargetId",
      };

      const result = await new DeleteTestTargetAction().deleteTestTarget(args, {
        testTargetRepository: new TestTargetRepository(testTargetResponse),
        testTargetGroupRepository: new TestTargetGroupRepository(
          testTargetGroupResponse
        ),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(testTargetResponse.httpDelete).toBeCalledWith(
        "/test-targets/testTargetId"
      );

      expect(testTargetGroupResponse.httpGet).toBeCalledWith(
        "/test-target-groups/groupId"
      );

      expect(result.data).toEqual({
        id: "testTargetGroup",
        name: "testTargetName",
        index: 0,
        testTargets: [],
      });
    });
  });
});
