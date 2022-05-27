import {
  ProjectFetchable,
  ProjectStoryConvertable,
  ReadProjectDataAction,
} from "@/lib/testManagement/actions/ReadProjectDataAction";
import { Story } from "@/lib/testManagement/types";

describe("ReadProjectDataActionの", () => {
  describe("#read", () => {
    describe("projectデータを取得し、storeにセットする", () => {
      it("正常系", async () => {
        const observer = {
          setProjectId: jest.fn(),
          setManagedData: jest.fn(),
          setStoriesData: jest.fn(),
          setProgressDatas: jest.fn(),
        };

        const projects = {
          status: 200,
          data: [{ id: "project1", name: "name1" }],
        };

        const targetProjectId = {
          status: 200,
          data: { id: "project1", name: "name1" },
        };

        const project = {
          id: "project1",
          name: "name1",
          testMatrices: [],
          progressDatas: [],
          stories: [
            {
              id: "s1",
              testMatrixId: "",
              viewPointId: "",
              status: "",
              sessions: [],
            },
          ],
        };

        const reply = {
          status: 200,
          data: project,
        };

        const projectRepository = {
          postProjectForExport: jest.fn(),
          getProjects: jest.fn().mockResolvedValue(projects),
          getProject: jest.fn().mockResolvedValue(reply),
          postProject: jest.fn().mockResolvedValue(targetProjectId),
          putProject: jest.fn(),
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

        const repositoryContainer: ProjectFetchable = {
          testResultRepository,
          projectRepository,
        };

        const storyDataConverter: ProjectStoryConvertable = {
          convertToStory: jest.fn().mockResolvedValue({
            id: "s1",
            testMatrixId: "",
            testTargetId: "",
            viewPointId: "",
            status: "",
            sessions: [],
          }),
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

        await new ReadProjectDataAction(
          observer,
          storyDataConverter,
          repositoryContainer
        ).read();

        expect(observer.setProjectId).toBeCalledWith({ projectId: "project1" });
        expect(observer.setManagedData).toBeCalledWith({
          testMatrices: [],
        });
        expect(storyDataConverter.convertToStory).toBeCalledTimes(1);
        expect(observer.setStoriesData).toBeCalledWith({
          stories,
        });
      });
    });
  });
});
