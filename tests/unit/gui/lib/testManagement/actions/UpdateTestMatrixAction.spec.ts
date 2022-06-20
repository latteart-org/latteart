import { UpdateTestMatrixAction } from "@/lib/testManagement/actions/UpdateTestMatrixAction";
import { Story, TestMatrix } from "@/lib/testManagement/types";

describe("UpdateTestMatrixAction", () => {
  describe("#updateTestMatrix", () => {
    it("viewPointを追加", async () => {
      const observer = {
        saveManagedData: jest.fn().mockResolvedValue([
          {
            id: "t1",
            name: "testMatrixName",
            groups: [
              {
                id: "g1",
                name: "groupName",
                testTargets: [
                  {
                    id: "t1",
                    name: "testTargetName",
                    plans: [
                      {
                        viewPointId: "v1",
                        value: 0,
                      },
                      {
                        viewPointId: "v2",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
            viewPoints: [
              {
                id: "v1",
                name: "viewPointName1",
                description: "viewPointDescription1",
              },
              {
                id: "v2",
                name: "viewPointName2",
                description: "viewPointDescription2",
              },
            ],
          },
        ]),
        addNewStory: jest.fn(),
      };

      const testMatrices: TestMatrix[] = [
        {
          id: "t1",
          name: "testMatrixName",
          groups: [
            {
              id: "g1",
              name: "groupName",
              testTargets: [
                {
                  id: "t1",
                  name: "testTargetName",
                  plans: [
                    {
                      viewPointId: "v1",
                      value: 0,
                    },
                  ],
                },
              ],
            },
          ],
          viewPoints: [
            {
              id: "v1",
              name: "viewPointName1",
              description: "viewPointDescription1",
              index: 0,
            },
          ],
        },
      ];

      const stories: Story[] = [
        {
          id: "t1_v1_g1_t1",
          testMatrixId: "",
          testTargetId: "",
          viewPointId: "v1",
          status: "status",
          sessions: [],
        },
      ];

      const updateMatrixData: {
        id: string;
        name: string;
        viewPoints: Array<{
          name: string;
          description: string;
          index: number;
          id: string | null;
        }>;
      } = {
        id: "t1",
        name: "testMatrixName",
        viewPoints: [
          {
            id: "v1",
            name: "viewPointName1",
            description: "viewPointDescription1",
            index: 0,
          },
          {
            id: undefined as unknown as string,
            name: "viewPointName2",
            description: "viewPointDescription2",
            index: 1,
          },
        ],
      };

      await new UpdateTestMatrixAction(observer).updateTestMatrix(
        testMatrices,
        stories,
        updateMatrixData
      );

      testMatrices[0].groups[0].testTargets[0].plans.push({
        viewPointId: "v2",
        value: 0,
      });
      testMatrices[0].viewPoints.push({
        id: undefined as unknown as string,
        name: "viewPointName2",
        description: "viewPointDescription2",
        index: 1,
      });

      expect(observer.saveManagedData).toBeCalledWith({
        testMatrices: testMatrices,
        stories: stories,
      });

      expect(observer.addNewStory).toBeCalledWith();
    });
  });
});
