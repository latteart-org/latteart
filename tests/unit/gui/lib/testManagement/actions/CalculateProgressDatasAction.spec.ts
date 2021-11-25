import {
  CalculateProgressDatasAction,
  StoryAchievement,
  ProgressDataTimestamp,
} from "@/lib/testManagement/actions/CalculateProgressDatasAction";
import { ProgressData, TestMatrix } from "@/lib/testManagement/types";

describe("CalculateProgressDatasAction", () => {
  describe("#calculate", () => {
    const group1 = {
      id: "groupId1",
      name: "groupName1",
      testTargets: [
        {
          id: "testTargetId1",
          name: "testTargetName1",
          plans: [
            {
              viewPointId: "viewPointId1",
              value: 1,
            },
          ],
        },
      ],
    };

    const testMatrices: TestMatrix[] = [
      {
        id: "matrixId1",
        name: "matrixName1",
        groups: [group1],
        viewPoints: [],
      },
      {
        id: "matrixId2",
        name: "matrixName2",
        groups: [group1],
        viewPoints: [],
      },
    ];

    const stories: StoryAchievement[] = [
      {
        id: "matrixId1_viewPointId1_groupId1_testTargetId1",
        sessions: [{ isDone: true }, { isDone: false }],
      },
      {
        id: "matrixId2_viewPointId1_groupId1_testTargetId1",
        sessions: [{ isDone: true }, { isDone: false }],
      },
    ];

    const groupProgressData1 = {
      id: "groupId1",
      name: "groupName1",
      testTargets: [
        {
          id: "testTargetId1",
          name: "testTargetName1",
          progress: {
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
        },
      ],
    };

    const groupProgressData2 = {
      id: "groupId1",
      name: "groupName1",
      testTargets: [
        {
          id: "testTargetId1",
          name: "testTargetName1",
          progress: {
            planNumber: 0,
            completedNumber: 0,
            incompletedNumber: 0,
          },
        },
      ],
    };

    it("既存の進捗がないテストマトリクスは新規の日付として進捗を追加する", () => {
      const timestamp: ProgressDataTimestamp = {
        value: 0,
        isSameDayAs: jest.fn().mockReturnValue(true),
      };

      const oldProgressData = {
        date: timestamp.value.toString(),
        groups: [groupProgressData2],
      };

      const newProgressData = {
        date: timestamp.value.toString(),
        groups: [groupProgressData1],
      };

      const progressDatas: ProgressData[] = [
        {
          testMatrixId: "matrixId1",
          testMatrixProgressDatas: [oldProgressData],
        },
      ];

      const resultDatas = new CalculateProgressDatasAction().calculate(
        timestamp,
        testMatrices,
        stories,
        progressDatas
      );

      expect(resultDatas).toEqual([
        {
          testMatrixId: "matrixId1",
          testMatrixProgressDatas: [newProgressData],
        },
        {
          testMatrixId: "matrixId2",
          testMatrixProgressDatas: [
            {
              date: timestamp.value.toString(),
              groups: [groupProgressData1],
            },
          ],
        },
      ]);
    });

    describe("既存の進捗があるテストマトリクスの場合", () => {
      it("既存の進捗が同日の場合はその日の進捗を更新する", () => {
        const timestamp: ProgressDataTimestamp = {
          value: 0,
          isSameDayAs: jest.fn().mockReturnValue(true),
        };

        const oldProgressData = {
          date: timestamp.value.toString(),
          groups: [groupProgressData2],
        };

        const newProgressData = {
          date: timestamp.value.toString(),
          groups: [groupProgressData1],
        };

        const progressDatas: ProgressData[] = [
          {
            testMatrixId: "matrixId1",
            testMatrixProgressDatas: [oldProgressData],
          },
          {
            testMatrixId: "matrixId2",
            testMatrixProgressDatas: [oldProgressData],
          },
        ];

        const resultDatas = new CalculateProgressDatasAction().calculate(
          timestamp,
          testMatrices,
          stories,
          progressDatas
        );

        expect(resultDatas).toEqual([
          {
            testMatrixId: "matrixId1",
            testMatrixProgressDatas: [newProgressData],
          },
          {
            testMatrixId: "matrixId2",
            testMatrixProgressDatas: [newProgressData],
          },
        ]);
      });

      it("既存の進捗が別日の場合は新規の日付として追加する", () => {
        const timestamp: ProgressDataTimestamp = {
          value: 0,
          isSameDayAs: jest.fn().mockReturnValue(false),
        };

        const oldProgressData = {
          date: timestamp.value.toString(),
          groups: [groupProgressData2],
        };

        const newProgressData = {
          date: timestamp.value.toString(),
          groups: [groupProgressData1],
        };

        const progressDatas: ProgressData[] = [
          {
            testMatrixId: "matrixId1",
            testMatrixProgressDatas: [oldProgressData],
          },
          {
            testMatrixId: "matrixId2",
            testMatrixProgressDatas: [oldProgressData],
          },
        ];

        const resultDatas = new CalculateProgressDatasAction().calculate(
          timestamp,
          testMatrices,
          stories,
          progressDatas
        );

        expect(resultDatas).toEqual([
          {
            testMatrixId: "matrixId1",
            testMatrixProgressDatas: [oldProgressData, newProgressData],
          },
          {
            testMatrixId: "matrixId2",
            testMatrixProgressDatas: [oldProgressData, newProgressData],
          },
        ]);
      });
    });
  });
});
