import {
  TestTargetGroupRepository,
  TestTargetRepository,
} from "latteart-client";
import { RESTClient } from "latteart-client";
import { UpdateTestTargetsAction } from "@/lib/testManagement/actions/UpdateTestTargetsAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
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
        projectId: "projectId",
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
        "api/v1/projects/projectId/test-targets/testTargetId",
        {
          name: "testTargetName",
          index: 0,
          plans: [],
        }
      );

      expect(testTargetGroupResponse.httpGet).toBeCalledWith(
        "api/v1/test-target-groups/groupId"
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
