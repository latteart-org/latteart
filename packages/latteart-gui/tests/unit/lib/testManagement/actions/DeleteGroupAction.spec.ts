import {
  TestMatrixRepository,
  TestTargetGroupRepository,
} from "latteart-client";
import { RESTClient } from "latteart-client";
import { DeleteGroupAction } from "@/lib/testManagement/actions/DeleteGroupAction";

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
  describe("#deleteGroup", () => {
    it("groupを削除する", async () => {
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpDelete: jest.fn().mockReturnValue({
          status: 204,
        }),
      };

      const testMatrixResponse = {
        ...baseRestClient,
        httpGet: jest.fn().mockReturnValue({
          status: 200,
          data: {
            id: "testMatrixId",
            name: "testMatrixName",
            index: 0,
            groups: [],
            viewPoints: [],
          },
        }),
      };

      const args = {
        testMatrixId: "testMatrixId",
        groupId: "groupId",
      };

      const result = await new DeleteGroupAction().deleteGroup(args, {
        testTargetGroupRepository: new TestTargetGroupRepository(
          testTargetGroupResponse
        ),
        testMatrixRepository: new TestMatrixRepository(testMatrixResponse),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(testTargetGroupResponse.httpDelete).toBeCalledWith(
        "api/v1/test-target-groups/groupId"
      );

      expect(testMatrixResponse.httpGet).toBeCalledWith(
        "api/v1/test-matrices/testMatrixId"
      );

      expect(result.data).toEqual({
        id: "testMatrixId",
        name: "testMatrixName",
        index: 0,
        groups: [],
        viewPoints: [],
      });
    });
  });
});
