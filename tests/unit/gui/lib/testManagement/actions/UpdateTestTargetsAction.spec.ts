import { TestTargetGroupRepository } from "@/lib/eventDispatcher/repositoryService/TestTargetGroupRepository";
import { TestTargetRepository } from "@/lib/eventDispatcher/repositoryService/TestTargetRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";
import { UpdateTestTargetsAction } from "@/lib/testManagement/actions/UpdateTestTargetsAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("UpdateTestTargetsAction", () => {
  describe("#updateTestTargets", () => {
    it("TestTarget更新", async () => {
      const testTargetResponse = {
        ...baseRestClient,
        httpPatch: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "testTargetId",
            name: "testTargetName",
            index: 0,
            plans: [],
          },
        }),
      };
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpGet: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "groupId",
            name: "groupName",
            index: 0,
            testTargets: [
              {
                id: "testTargetId",
                name: "testTargetName",
                index: 0,
                plans: [],
              },
            ],
          },
        }),
      };

      const args = {
        testMatrixId: "testMatrixId",
        groupId: "groupId",
        testTargets: [
          {
            id: "testTargetId",
            name: "testTargetName",
            index: 0,
            plans: [],
          },
        ],
      };

      const result = await new UpdateTestTargetsAction().updateTestTargets(
        args,
        {
          testTargetRepository: new TestTargetRepository(testTargetResponse),
          testTargetGroupRepository: new TestTargetGroupRepository(
            testTargetGroupResponse
          ),
        }
      );

      if (result.isFailure()) {
        throw result.error;
      }

      expect(testTargetResponse.httpPatch).toBeCalledWith(
        "/test-targets/testTargetId",
        {
          name: "testTargetName",
          index: 0,
          plans: [],
        }
      );

      expect(testTargetGroupResponse.httpGet).toBeCalledWith(
        "/test-target-groups/groupId"
      );

      expect(result.data).toEqual({
        id: "groupId",
        name: "groupName",
        index: 0,
        testTargets: [
          {
            id: "testTargetId",
            name: "testTargetName",
            index: 0,
            plans: [],
          },
        ],
      });
    });
  });
});
