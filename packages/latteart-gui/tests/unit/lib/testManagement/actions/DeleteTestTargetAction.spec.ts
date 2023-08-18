import {
  TestTargetGroupRepository,
  TestTargetRepository,
} from "latteart-client";
import { RESTClient } from "latteart-client";
import { DeleteTestTargetAction } from "@/lib/testManagement/actions/DeleteTestTargetAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
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
        projectId: "projectId",
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
        "api/v1/projects/projectId/test-targets/testTargetId"
      );

      expect(testTargetGroupResponse.httpGet).toBeCalledWith(
        "api/v1/test-target-groups/groupId"
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
