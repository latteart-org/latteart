import { TestTargetGroupRepository } from "@/lib/eventDispatcher/repositoryService/TestTargetGroupRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";
import { AddNewGroupAction } from "@/lib/testManagement/actions/AddNewGroupAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("AddNewGroupAction", () => {
  describe("#addNewGroup", () => {
    it("Groupを追加する", async () => {
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpPost: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "testTargetGroupId",
            name: "testTargetGroupName",
            index: 0,
            testTargets: [],
          },
        }),
      };

      const args = {
        testMatrixId: "testMatrixId",
        name: "testTargetGroupName",
      };

      const result = await new AddNewGroupAction().addNewGroup(args, {
        testTargetGroupRepository: new TestTargetGroupRepository(
          testTargetGroupResponse
        ),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(testTargetGroupResponse.httpPost).toBeCalledWith(
        "/test-target-groups",
        {
          testMatrixId: "testMatrixId",
          name: "testTargetGroupName",
        }
      );

      expect(result.data).toEqual({
        id: "testTargetGroupId",
        name: "testTargetGroupName",
        index: 0,
        testTargets: [],
      });
    });
  });
});
