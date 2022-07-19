import { ProjectRESTRepository } from "@/lib/eventDispatcher/repositoryService/ProjectRepository";
import { TestMatrixRepository } from "@/lib/eventDispatcher/repositoryService/TestMatrixRepository";
import { ViewPointRepository } from "@/lib/eventDispatcher/repositoryService/ViewPointRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";
import { UpdateTestMatrixAction } from "@/lib/testManagement/actions/UpdateTestMatrixAction";

const beseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("UpdateTestMatrixAction", () => {
  describe("#updateTestMatrix", () => {
    it("TestMatrix更新、ViewPoint作成・更新・削除", async () => {
      const testMatrixResponse = {
        ...beseRestClient,
        httpPatch: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "testMatrixId",
            name: "newTestMatrixName",
            index: 0,
            groups: [],
            viewPoints: [],
          },
        }),
      };
      const viewPointResponse = {
        ...beseRestClient,
        httpPost: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "viewPointId",
            name: "viewPointName",
            description: "viewPointDescription",
            index: 0,
          },
        }),
        httpPatch: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            id: "viewPointId1",
            name: "viewPointName1",
            description: "viewPointDescription1",
            index: 0,
          },
        }),
        httpDelete: jest.fn().mockResolvedValue({ status: 204 }),
      };
      const projectResponse = {
        ...beseRestClient,
        httpGet: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            testMatrices: [
              {
                id: "testMatrixId",
                name: "newTestMatrixName",
                index: 0,
                groups: [],
                viewPoints: [
                  {
                    id: "viewPointId1",
                    name: "viewPointName1",
                    description: "viewPointDescription1",
                    index: 0,
                  },
                  {
                    id: "viewPointId2",
                    name: "viewPointName2",
                    description: "viewPointDescription2",
                    index: 1,
                  },
                ],
              },
            ],
          },
        }),
      };

      const args = {
        projectId: "project1",
        newTestMatrix: {
          id: "testMatrixId1",
          name: "testMatrixName1",
        },
        newViewPoints: [
          {
            id: "viewPointId1",
            name: "viewPointName1",
            description: "viewPointDescription1",
            index: 0,
          },
          {
            id: null,
            name: "viewPointName2",
            description: "viewPointDescription2",
            index: 1,
          },
        ],
        oldTestMatrix: {
          id: "testMatrixId1",
          name: "testMatrixNameXXX",
          index: 0,
          groups: [],
          viewPoints: [
            {
              id: "viewPointId1",
              name: "viewPointName0",
              description: "viewPointDescription0",
              index: 0,
            },
            {
              id: "viewPointId3",
              name: "viewPointName3",
              description: "viewPointDescription3",
              index: 1,
            },
          ],
        },
      };
      const result = await new UpdateTestMatrixAction().updateTestMatrix(args, {
        testMatrixRepository: new TestMatrixRepository(testMatrixResponse),
        viewPointRepository: new ViewPointRepository(viewPointResponse),
        projectRepository: new ProjectRESTRepository(projectResponse),
      });

      expect(testMatrixResponse.httpPatch).toBeCalledWith(
        "/test-matrices/testMatrixId1",
        {
          name: "testMatrixName1",
        }
      );
      expect(viewPointResponse.httpPost).toBeCalledWith("/view-points", {
        name: "viewPointName2",
        description: "viewPointDescription2",
        index: 1,
        testMatrixId: "testMatrixId1",
      });
      expect(viewPointResponse.httpPatch).toBeCalledWith(
        "/view-points/viewPointId1",
        {
          name: "viewPointName1",
          description: "viewPointDescription1",
          index: 0,
        }
      );
      expect(viewPointResponse.httpDelete).toBeCalledWith(
        `/view-points/viewPointId3`
      );

      if (result.isFailure()) {
        throw result.error;
      }

      expect(result.data).toEqual([
        {
          groups: [],
          id: "testMatrixId",
          index: 0,
          name: "newTestMatrixName",
          viewPoints: [
            {
              description: "viewPointDescription1",
              id: "viewPointId1",
              index: 0,
              name: "viewPointName1",
            },
            {
              description: "viewPointDescription2",
              id: "viewPointId2",
              index: 1,
              name: "viewPointName2",
            },
          ],
        },
      ]);
    });
  });
});
