import {
  WriteDataFileMutationObserver,
  WriteDataFileAction,
} from "@/lib/testManagement/actions/WriteDataFileAction";
import { TestManagementData } from "@/lib/testManagement/TestManagementData";
import { Story, Project } from "@/lib/testManagement/types";
import { RESTClient, RESTClientResponse } from "src/common/network/http/client";
import { TestResultRepository, ProjectRESTRepository } from "src/common";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("WriteDataActionの", () => {
  describe("#write", () => {
    let observer: WriteDataFileMutationObserver;

    beforeEach(() => {
      observer = {
        setManagedData: jest.fn(),
        setStoriesData: jest.fn(),
      };
    });

    it("正常系", async () => {
      const expectedProject: Project = {
        id: "",
        name: "",
        testMatrices: [],
        stories: [
          {
            id: "s1",
            index: 0,
            status: "",
            sessions: [],
            testMatrixId: "",
            testTargetId: "",
            viewPointId: "",
          },
        ],
      };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedProject,
      };

      const restClient = {
        ...baseRestClient,
        httpPut: jest.fn().mockResolvedValue(resSuccess),
      };

      const testResultRepository = new TestResultRepository(restClient);
      const projectRepository = new ProjectRESTRepository(restClient);

      const repositoryService = {
        testResultRepository,
        projectRepository,
      };

      const projectId = "1";
      const testManagementData: TestManagementData = {
        testMatrices: [],
        stories: [],
      };
      const stories: Story[] = [
        {
          index: 0,
          id: "s1",
          status: "",
          sessions: [],
          testMatrixId: "",
          testTargetId: "",
          viewPointId: "",
        },
      ];

      const result = await new WriteDataFileAction(
        observer,
        repositoryService
      ).write(projectId, testManagementData, stories);

      expect(restClient.httpPut).toBeCalledWith(
        `api/v1/projects/${projectId}`,
        testManagementData
      );

      expect(observer.setManagedData).toBeCalledWith({
        testMatrices: expectedProject.testMatrices,
      });
      expect(observer.setStoriesData).toBeCalledWith({
        stories: expectedProject.stories,
      });

      if (result.isFailure()) {
        throw new Error("failed");
      }
    });
  });
});
