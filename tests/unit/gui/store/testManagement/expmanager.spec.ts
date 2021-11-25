describe.skip("testManagementストアは", () => {
  describe("actionsのsaveProgressDataが呼ばれたとき、進捗データを保存する", () => {
    let context: any;
    let expectedProgressData: any;
    let stories: any[];

    beforeEach(() => {
      stories = [
        {
          id: "storyId1",
          sessions: [{ isDone: true }],
          // status: CHARTER_STATUS.OUT_OF_SCOPE.id,
        },
        {
          id: "storyId2",
          sessions: [{ isDone: true }],
          // status: CHARTER_STATUS.OK.id,
        },
        {
          id: "storyId3",
          sessions: [{ isDone: false }],
          // status: CHARTER_STATUS.NG.id,
        },
        {
          id: "storyId4",
          sessions: [{ isDone: false }],
          // status: CHARTER_STATUS.ONGOING.id,
        },
        {
          id: "storyId5",
          sessions: [{ isDone: false }],
          // status: CHARTER_STATUS.PENDING.id,
        },
        {
          id: "storyId6",
          sessions: [{ isDone: false }],
          // status: 'hogehoge', // 不正な値
        },
      ];

      context = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: {
          findStoryByTestTargetAndGroupAndViewPointId: jest
            .fn()
            .mockReturnValueOnce(stories[0])
            .mockReturnValueOnce(stories[1])
            .mockReturnValueOnce(stories[2])
            .mockReturnValueOnce(stories[3])
            .mockReturnValueOnce(stories[4])
            .mockReturnValueOnce(stories[5]),
        },
        state: {
          groups: [
            {
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
                    {
                      viewPointId: "viewPointId2",
                      value: 1,
                    },
                  ],
                },
                {
                  id: "testTargetId2",
                  name: "testTargetName2",
                  plans: [
                    {
                      viewPointId: "viewPointId1",
                      value: 1,
                    },
                    {
                      viewPointId: "viewPointId2",
                      value: 1,
                    },
                  ],
                },
              ],
            },
            {
              id: "groupId2",
              name: "groupName2",
              testTargets: [
                {
                  id: "testTargetId3",
                  name: "testTargetName3",
                  plans: [
                    {
                      viewPointId: "viewPointId1",
                      value: 1,
                    },
                    {
                      viewPointId: "viewPointId2",
                      value: 1,
                    },
                  ],
                },
              ],
            },
          ],
          stories,
          progressDatas: [],
        },
      };

      expectedProgressData = {
        date: expect.any(String),
        groups: [
          {
            id: "groupId1",
            name: "groupName1",
            testTargets: [
              {
                id: "testTargetId1",
                name: "testTargetName1",
                progress: {
                  planNumber: 2,
                  // okNumber: 2,
                  // ngNumber: 0,
                  // pendingNumber: 0,
                  completedNumber: 2,
                  incompletedNumber: 0,
                },
              },
              {
                id: "testTargetId2",
                name: "testTargetName2",
                progress: {
                  planNumber: 2,
                  // okNumber: 0,
                  // ngNumber: 2,
                  // pendingNumber: 0,
                  completedNumber: 0,
                  incompletedNumber: 2,
                },
              },
            ],
          },
          {
            id: "groupId2",
            name: "groupName2",
            testTargets: [
              {
                id: "testTargetId3",
                name: "testTargetName3",
                progress: {
                  planNumber: 2,
                  // okNumber: 0,
                  // ngNumber: 0,
                  // pendingNumber: 1,
                  completedNumber: 0,
                  incompletedNumber: 2,
                },
              },
            ],
          },
        ],
      };
    });

    //   it('同日の進捗データが登録されていない場合は追加する', () => {

    //     context.state.progressDatas = [
    //       {
    //         date: moment().add(-1, 'days').unix().toString(),
    //         groups: [],
    //       },
    //     ];

    //     testManagement.actions.saveProgressData(context);

    //     expect(context.commit).toHaveBeenCalledWith('addProgressData', {
    //       data: expectedProgressData,
    //     });
    //     expect(context.dispatch).toHaveBeenCalledWith('writeDataFile');
    //   });

    //   it('同日の進捗データが既に登録されている場合は差し替える', () => {

    //     context.state.progressDatas = [
    //       {
    //         date: moment().unix().toString(),
    //         groups: [],
    //       },
    //     ];

    //     testManagement.actions.saveProgressData(context);

    //     expect(context.commit).toHaveBeenCalledWith('setProgressData', {
    //       index: 0,
    //       data: expectedProgressData,
    //     });
    //     expect(context.dispatch).toHaveBeenCalledWith('writeDataFile');
    //   });
    // });
    // describe('actionsのreadDataFileが呼ばれたとき、データをstoreに読み込む', () => {
    //   const managedDataJsonFileName = 'managed_data.json';
    //   const configJsonFileName = 'latteart.config.json';
    //   const managedDataJsonSrcPath = `./tests/resources/${managedDataJsonFileName}`;

    //   const currentDirPath = __dirname;
    //   const saveDirPath = path.resolve(currentDirPath, 'test');
    //   const saveDataDirPath = path.resolve(saveDirPath, 'data');

    //   const managedDataJsonDistPath = path.resolve(saveDataDirPath, managedDataJsonFileName);
    //   const initConfigJsonDistPath = path.resolve(saveDirPath, configJsonFileName);

    //   let context: any;

    //   beforeEach(() => {
    //     context = {
    //       commit: jest.fn(),
    //       rootGetters: {
    //         getSetting: jest.fn().mockReturnValue([]),
    //       },
    //       state: {
    //         saveDirPath,
    //       },
    //     };
    //     mkTestDir();
    //   });

    //   const mkTestDir = () => {
    //     try {
    //       fs.statSync(saveDirPath);
    //     } catch (error) {
    //       fs.mkdirSync(saveDirPath);
    //     }
    //     try {
    //       fs.statSync(saveDataDirPath);
    //     } catch (error) {
    //       fs.mkdirSync(saveDataDirPath);
    //     }
    //   };
    //   const copyDataFile = () => {
    //     fs.copyFileSync(managedDataJsonSrcPath, managedDataJsonDistPath);
    //   };
    //   const rmTestData = () => {
    //     try {
    //       fs.statSync(managedDataJsonDistPath);
    //       fs.unlinkSync(managedDataJsonDistPath);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //     try {
    //       fs.statSync(saveDataDirPath);
    //       fs.rmdirSync(saveDataDirPath);

    //       fs.statSync(saveDirPath);
    //       fs.rmdirSync(saveDirPath);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   };

    //   afterEach(() => {
    //     rmTestData();
    //   });

    //   it('managed_data.json：有, latteart.config.json：有', () => {
    //     copyDataFile();

    //     context.rootGetters.getSetting = jest.fn().mockReturnValue([
    //       {
    //         name: '基本フロー',
    //       },
    //       {
    //         name: '代替フロー',
    //       },
    //       {
    //         name: '例外フロー',
    //       },
    //       {
    //         name: '中断・再開・繰り返し',
    //       },
    //       {
    //         name: 'データライフサイクル',
    //       },
    //       {
    //         name: '共有・排他・ロールセキュリティ',
    //       },
    //       {
    //         name: '入出力',
    //       },
    //     ]);

    //     testManagement.actions.readDataFile(context);

    //     expect(context.commit).toHaveBeenNthCalledWith(1, 'setManagedData', {
    //       groupSequence: 0,
    //       groups: [],
    //       viewPoints: [],
    //       storySequence: 0,
    //     });
    //     expect(context.commit).toHaveBeenNthCalledWith(2, 'setStoriesData', {
    //       stories: [],
    //     });
    //     expect(context.commit).toHaveBeenNthCalledWith(3, 'setProgressDatas', {
    //       progressDatas: [],
    //     });
    //   });

    //   it('managed_data.json：有, latteart.config.json：無', () => {
    //     copyDataFile();

    //     testManagement.actions.readDataFile(context);

    //     expect(context.commit).toHaveBeenNthCalledWith(1, 'setManagedData', {
    //       groupSequence: 0,
    //       groups: [],
    //       viewPoints: [],
    //       storySequence: 0,
    //     });
    //     expect(context.commit).toHaveBeenNthCalledWith(2, 'setStoriesData', {
    //       stories: [],
    //     });
    //     expect(context.commit).toHaveBeenNthCalledWith(3, 'setProgressDatas', {
    //       progressDatas: [],
    //     });
    //   });

    //   it('managed_data.json：無, latteart.config.json：有', () => {
    //     context.rootGetters.getSetting = jest.fn().mockReturnValue([
    //       {
    //         name: '基本フロー',
    //       },
    //       {
    //         name: '代替フロー',
    //       },
    //       {
    //         name: '例外フロー',
    //       },
    //       {
    //         name: '中断・再開・繰り返し',
    //       },
    //       {
    //         name: 'データライフサイクル',
    //       },
    //       {
    //         name: '共有・排他・ロールセキュリティ',
    //       },
    //       {
    //         name: '入出力',
    //       },
    //     ]);

    //     testManagement.actions.readDataFile(context);

    //     expect(context.commit).toHaveBeenNthCalledWith(1, 'initViewPointsData', {
    //       viewPoints: [
    //         {
    //           name: '基本フロー',
    //         },
    //         {
    //           name: '代替フロー',
    //         },
    //         {
    //           name: '例外フロー',
    //         },
    //         {
    //           name: '中断・再開・繰り返し',
    //         },
    //         {
    //           name: 'データライフサイクル',
    //         },
    //         {
    //           name: '共有・排他・ロールセキュリティ',
    //         },
    //         {
    //           name: '入出力',
    //         },
    //       ],
    //     });
    //   });

    it("managed_data.json：無, latteart.config.json：無", () => {
      // testManagement.actions.readDataFile(context);
      // expect(context.commit).toHaveBeenNthCalledWith(1, 'initViewPointsData', {
      //   viewPoints: [],
      // });
    });
  });
});
