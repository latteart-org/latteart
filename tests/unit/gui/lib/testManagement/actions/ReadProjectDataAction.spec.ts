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

        const dispatcher: ProjectFetchable = {
          readProject: jest.fn().mockResolvedValue({
            data: {
              projectId: "project1",
              testMatrices: [],
              progressDatas: [],
              stories: [
                {
                  id: "s1",
                  testMatrixId: "",
                  testTargetId: "",
                  viewPointId: "",
                  status: "",
                  sessions: [],
                },
              ],
            },
          }),
          putProject: jest.fn(),
          getTestResult: jest.fn(),
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
          dispatcher
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
