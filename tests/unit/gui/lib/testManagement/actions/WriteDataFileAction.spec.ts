import {
  ProjectUpdatable,
  StoryConvertable,
  WriteDataFileAction,
} from "@/lib/testManagement/actions/WriteDataFileAction";
import { TestManagementData } from "@/lib/testManagement/TestManagementData";
import { Story } from "@/lib/testManagement/types";

describe("WriteDataActionの", () => {
  describe("#write", () => {
    it("正常系", async () => {
      const observer = {
        setManagedData: jest.fn(),
        setStoriesData: jest.fn(),
      };

      const testResultRepository = {
        deleteTestResult: jest.fn(),
        postTestResultForExport: jest.fn(),
        postTestResultForUpload: jest.fn(),
        postEmptyTestResult: jest.fn(),
        getTestResults: jest.fn(),
        getTestResult: jest.fn(),
        patchTestResult: jest.fn(),
      };

      const projectRepository = {
        postProjectForExport: jest.fn(),
        getProjects: jest.fn(),
        getProject: jest.fn(),
        postProject: jest.fn(),
        putProject: jest.fn().mockResolvedValue({
          data: {
            testMatrices: [],
            progressDatas: [],
            stories: [
              {
                id: "s1",
                status: "",
                sessions: [],
              },
            ],
          },
        }),
      };

      const repositoryContainer: ProjectUpdatable = {
        testResultRepository,
        projectRepository,
      };

      const storyDataConverter: StoryConvertable = {
        convertToStory: jest.fn().mockResolvedValue({
          id: "s1",
          testMatrixId: "",
          testTargetId: "",
          viewPointId: "",
          status: "",
          sessions: [],
        }),
      };

      const projectId = "1";
      const testManagementData: TestManagementData = {
        testMatrices: [],
        stories: [],
        progressDatas: [],
      };
      const stories: Story[] = [
        {
          id: "s1",
          testMatrixId: "",
          testTargetId: "",
          viewPointId: "",
          status: "",
          sessions: [],
        },
      ];

      await new WriteDataFileAction(
        observer,
        storyDataConverter,
        repositoryContainer
      ).write(projectId, testManagementData, stories);

      expect(observer.setManagedData).toBeCalledWith({
        testMatrices: [],
        progressDatas: [],
      });
      expect(storyDataConverter.convertToStory).toBeCalledTimes(1);
      expect(observer.setStoriesData).toBeCalledWith({
        stories,
      });
    });
  });
});
