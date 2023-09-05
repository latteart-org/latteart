import { ProjectRESTRepository, TestMatrixRepository } from "latteart-client";
import { RESTClient } from "latteart-client";
import { DeleteTestMatrixAction } from "@/lib/testManagement/actions/DeleteTestMatrixAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
};

describe("DeleteTestMatrixAction", () => {
  describe("#deleteTestMatrix", () => {
    it("TestMatrixを削除する", async () => {
      const testMatrixResponse = {
        ...baseRestClient,
        httpDelete: jest.fn().mockResolvedValue({
          status: 204,
        }),
      };

      const projectResponse = {
        ...baseRestClient,
        httpGet: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "projectId",
            name: "projectName",
            testMatrices: [],
            stories: [],
            progressDatas: [],
          },
        }),
      };

      const args = {
        projectId: "projectId",
        testMatrixId: "testMatrixId",
      };

      const result = await new DeleteTestMatrixAction().deleteTestMatrix(args, {
        testMatrixRepository: new TestMatrixRepository(testMatrixResponse),
        projectRepository: new ProjectRESTRepository(projectResponse),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(testMatrixResponse.httpDelete).toBeCalledWith(
        "api/v1/test-matrices/testMatrixId"
      );

      expect(projectResponse.httpGet).toBeCalledWith(
        "api/v1/projects/projectId"
      );
    });
  });
});
