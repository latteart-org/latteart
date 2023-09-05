import {
  TestMatrixRepository,
  TestTargetGroupRepository,
} from "latteart-client";
import { RESTClient } from "latteart-client";
import { UpdateGroupAction } from "@/lib/testManagement/actions/UpdateGroupAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
};

describe("DeleteGroupAction", () => {
  describe("#updateGroup", () => {
    it("groupを更新する", async () => {
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpPatch: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "groupId",
            name: "groupName",
            index: 0,
            testTargets: [],
          },
        }),
      };

      const testMatrixResponse = {
        ...baseRestClient,
        httpGet: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "testMatrixId",
            name: "testMatrixName",
            index: 0,
            groups: [
              {
                id: "groupId",
                name: "groupName",
                index: 0,
                testTargets: [],
              },
            ],
          },
        }),
      };

      const args = {
        testMatrixId: "testMatrixId",
        groupId: "groupId",
        name: "groupName",
      };

      const result = await new UpdateGroupAction().updateGroup(args, {
        testTargetGroupRepository: new TestTargetGroupRepository(
          testTargetGroupResponse
        ),
        testMatrixRepository: new TestMatrixRepository(testMatrixResponse),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(testTargetGroupResponse.httpPatch).toBeCalledWith(
        "api/v1/test-target-groups/groupId",
        { name: "groupName" }
      );

      expect(testMatrixResponse.httpGet).toBeCalledWith(
        "api/v1/test-matrices/testMatrixId"
      );

      expect(result.data).toEqual({
        id: "testMatrixId",
        name: "testMatrixName",
        index: 0,
        groups: [
          {
            id: "groupId",
            name: "groupName",
            index: 0,
            testTargets: [],
          },
        ],
      });
    });
  });
});
