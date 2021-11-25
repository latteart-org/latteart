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
          setManagedData: jest.fn(),
          setStoriesData: jest.fn(),
          setProgressDatas: jest.fn(),
        };

        const dispatcher: ProjectFetchable = {
          readProject: jest.fn().mockResolvedValue({
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
          putProject: jest.fn(),
          getTestResult: jest.fn(),
        };

        const storyDataConverter: ProjectStoryConvertable = {
          convertToStory: jest
            .fn()
            .mockResolvedValue({ id: "s1", status: "", sessions: [] }),
        };

        const stories: Story[] = [{ id: "s1", status: "", sessions: [] }];

        await new ReadProjectDataAction(
          observer,
          storyDataConverter,
          dispatcher
        ).read("1");

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
