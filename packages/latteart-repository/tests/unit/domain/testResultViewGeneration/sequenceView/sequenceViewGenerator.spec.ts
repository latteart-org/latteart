import {
  generateSequenceView,
  SequenceView,
  TestStepForSequenceView,
} from "@/domain/testResultViewGeneration/sequenceView";

describe("generateSequenceView", () => {
  describe("テストステップ群を元に、テストの大まかな流れを表現するオブジェクトを生成して返す", () => {
    describe("目的ごとにシナリオを区切る", () => {
      const testStepBase1 = {
        id: "id1",
        operation: {
          input: "input1",
          type: "type1",
          elementInfo: {
            xpath: "xpath1",
            tagname: "tagname1",
            text: "text1",
            attributes: {
              value: "value1",
            },
          },
        },
      } as const;
      const testStepBase2 = {
        id: "id2",
        operation: {
          input: "input2",
          type: "type2",
          elementInfo: {
            xpath: "xpath2",
            tagname: "tagname2",
            text: "text2",
            attributes: {
              value: "value2",
            },
          },
        },
      } as const;
      const testPurpose1 = {
        id: "purpose1",
        value: "purposeValue1",
        details: "purposeDetails1",
      } as const;
      const testPurpose2 = {
        id: "purpose2",
        value: "purposeValue2",
        details: "purposeDetails2",
      } as const;

      const expectedTestStep1 = {
        id: "id1",
        type: "type1",
        input: "input1",
        element: {
          xpath: "xpath1",
          tagname: "tagname1",
          text: "text1",
        },
      } as const;
      const expectedTestStep2 = {
        id: "id2",
        type: "type2",
        input: "input2",
        element: {
          xpath: "xpath2",
          tagname: "tagname2",
          text: "text2",
        },
      } as const;
      const expectedTestPurpose1 = {
        id: "purpose1",
        value: "purposeValue1",
        details: "purposeDetails1",
      } as const;
      const expectedTestPurpose2 = {
        id: "purpose2",
        value: "purposeValue2",
        details: "purposeDetails2",
      } as const;

      it("テストステップが1つもない場合", () => {
        const testSteps: TestStepForSequenceView[] = [];

        const result = generateSequenceView("", testSteps);

        expect(result).toEqual({
          testResultId: "",
          windows: [],
          screens: [],
          scenarios: [],
        });
      });

      it("1つ目のテストステップに目的がある場合", () => {
        const testResultId = "id1";
        const result: SequenceView = generateSequenceView(testResultId, [
          {
            ...testStepBase1,
            operation: {
              ...testStepBase1.operation,
              windowHandle: "windowHandle1",
            },
            screenDef: "screenDef1",
            bugs: [],
            notices: [],
            intention: testPurpose1,
          },
          {
            ...testStepBase2,
            operation: {
              ...testStepBase2.operation,
              windowHandle: "windowHandle1",
            },
            screenDef: "screenDef1",
            bugs: [],
            notices: [],
            intention: null,
          },
        ]);

        expect(result).toEqual({
          testResultId,
          windows: [{ id: "windowHandle1", name: "window1" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: expectedTestPurpose1,
              nodes: [
                {
                  windowId: "windowHandle1",
                  screenId: "s0",
                  testSteps: [
                    { ...expectedTestStep1, notes: [] },
                    { ...expectedTestStep2, notes: [] },
                  ],
                },
              ],
            },
          ],
        });
      });

      it("2つ目のテストステップに目的がある場合", () => {
        const testSteps: TestStepForSequenceView[] = [
          {
            ...testStepBase1,
            operation: {
              ...testStepBase1.operation,
              windowHandle: "windowHandle1",
            },
            screenDef: "screenDef1",
            bugs: [],
            notices: [],
            intention: null,
          },
          {
            ...testStepBase2,
            operation: {
              ...testStepBase2.operation,
              windowHandle: "windowHandle1",
            },
            screenDef: "screenDef1",
            bugs: [],
            notices: [],
            intention: testPurpose1,
          },
        ];

        const testResultId = "id1";
        const result: SequenceView = generateSequenceView(
          testResultId,
          testSteps
        );

        expect(result).toEqual({
          testResultId,
          windows: [{ id: "windowHandle1", name: "window1" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "windowHandle1",
                  screenId: "s0",
                  testSteps: [{ ...expectedTestStep1, notes: [] }],
                },
              ],
            },
            {
              testPurpose: expectedTestPurpose1,
              nodes: [
                {
                  windowId: "windowHandle1",
                  screenId: "s0",
                  testSteps: [{ ...expectedTestStep2, notes: [] }],
                },
              ],
            },
          ],
        });
      });

      it("1つ目と2つ目のテストステップに目的がある場合", () => {
        const testSteps: TestStepForSequenceView[] = [
          {
            ...testStepBase1,
            operation: {
              ...testStepBase1.operation,
              windowHandle: "windowHandle1",
            },
            screenDef: "screenDef1",
            bugs: [],
            notices: [],
            intention: testPurpose1,
          },
          {
            ...testStepBase2,
            operation: {
              ...testStepBase2.operation,
              windowHandle: "windowHandle1",
            },
            screenDef: "screenDef1",
            bugs: [],
            notices: [],
            intention: testPurpose2,
          },
        ];
        const testResultId = "id1";

        const result: SequenceView = generateSequenceView(
          testResultId,
          testSteps
        );

        expect(result).toEqual({
          testResultId,
          windows: [{ id: "windowHandle1", name: "window1" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: expectedTestPurpose1,
              nodes: [
                {
                  windowId: "windowHandle1",
                  screenId: "s0",
                  testSteps: [{ ...expectedTestStep1, notes: [] }],
                },
              ],
            },
            {
              testPurpose: expectedTestPurpose2,
              nodes: [
                {
                  windowId: "windowHandle1",
                  screenId: "s0",
                  testSteps: [{ ...expectedTestStep2, notes: [] }],
                },
              ],
            },
          ],
        });
      });
    });

    describe("シナリオ内の各テストステップは画面遷移毎にノードとしてグループ化する", () => {
      const operationBase = {
        input: "input1",
        elementInfo: {
          xpath: "xpath1",
          tagname: "tagname1",
          text: "text1",
          attributes: {
            value: "value1",
          },
        },
      };
      const testStepBase = {
        operation: operationBase,
        bugs: [],
        notices: [],
        intention: null,
      };
      const expectedTestStepBase = {
        input: "input1",
        element: { xpath: "xpath1", tagname: "tagname1", text: "text1" },
        notes: [],
      } as const;

      it("screen_transitionがあった場合はそのテストステップから別ノードとする", () => {
        const testSteps: TestStepForSequenceView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: { ...operationBase, type: "type1", windowHandle: "w1" },
            screenDef: "画面A",
          },
          {
            ...testStepBase,
            id: "ts2",
            operation: { ...operationBase, type: "type1", windowHandle: "w1" },
            screenDef: "画面A",
          },
          {
            ...testStepBase,
            id: "ts3",
            operation: {
              ...operationBase,
              type: "screen_transition",
              windowHandle: "w1",
            },
            screenDef: "画面A",
          },
          {
            ...testStepBase,
            id: "ts4",
            operation: { ...operationBase, type: "type1", windowHandle: "w1" },
            screenDef: "画面A",
          },
        ];

        const testResultId = "testResult1";

        const result = generateSequenceView(testResultId, testSteps);

        expect(result).toEqual({
          testResultId,
          windows: [{ id: "w1", name: "window1" }],
          screens: [{ id: "s0", name: "画面A" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w1",
                  screenId: "s0",
                  testSteps: [
                    { ...expectedTestStepBase, id: "ts1", type: "type1" },
                    { ...expectedTestStepBase, id: "ts2", type: "type1" },
                  ],
                },
                {
                  windowId: "w1",
                  screenId: "s0",
                  testSteps: [
                    {
                      ...expectedTestStepBase,
                      id: "ts3",
                      type: "screen_transition",
                    },
                    { ...expectedTestStepBase, id: "ts4", type: "type1" },
                  ],
                },
              ],
            },
          ],
        });
      });

      describe("pause_capturingがあったら、直後に空の無効ノードを追加する", () => {
        it(`pause_capturingが最後のテストステップの場合`, () => {
          const testSteps: TestStepForSequenceView[] = [
            {
              ...testStepBase,
              id: "ts1",
              operation: {
                ...operationBase,
                type: "type1",
                windowHandle: "w1",
              },
              screenDef: "画面A",
            },
            {
              ...testStepBase,
              id: "ts2",
              operation: {
                ...operationBase,
                type: "pause_capturing",
                windowHandle: "w1",
              },
              screenDef: "画面A",
            },
          ];

          const testResultId = "testResult1";

          const result = generateSequenceView(testResultId, testSteps);

          expect(result).toEqual({
            testResultId,
            windows: [{ id: "w1", name: "window1" }],
            screens: [{ id: "s0", name: "画面A" }],
            scenarios: [
              {
                nodes: [
                  {
                    windowId: "w1",
                    screenId: "s0",
                    testSteps: [
                      { ...expectedTestStepBase, id: "ts1", type: "type1" },
                      {
                        ...expectedTestStepBase,
                        id: "ts2",
                        type: "pause_capturing",
                      },
                    ],
                  },
                  {
                    windowId: "w1",
                    screenId: "s0",
                    testSteps: [],
                    disabled: true,
                  },
                ],
              },
            ],
          });
        });

        describe.each`
          resumeKeyword
          ${"resume_capturing"}
          ${"start_capturing"}
        `(
          "pause_capturingが最後のテストステップでない場合、次の$resumeKeywordまでのノードを全て無効ノードとする",
          ({ resumeKeyword }) => {
            it(`pause_capturingと${resumeKeyword}の間にテストステップが無い場合`, () => {
              const testSteps: TestStepForSequenceView[] = [
                {
                  ...testStepBase,
                  id: "ts1",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts2",
                  operation: {
                    ...operationBase,
                    type: "pause_capturing",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts3",
                  operation: {
                    ...operationBase,
                    type: resumeKeyword,
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts4",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
              ];

              const testResultId = "testResult1";

              const result = generateSequenceView(testResultId, testSteps);

              expect(result).toEqual({
                testResultId,
                windows: [{ id: "w1", name: "window1" }],
                screens: [{ id: "s0", name: "画面A" }],
                scenarios: [
                  {
                    nodes: [
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          { ...expectedTestStepBase, id: "ts1", type: "type1" },
                          {
                            ...expectedTestStepBase,
                            id: "ts2",
                            type: "pause_capturing",
                          },
                        ],
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [],
                        disabled: true,
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          {
                            ...expectedTestStepBase,
                            id: "ts3",
                            type: resumeKeyword,
                          },
                          { ...expectedTestStepBase, id: "ts4", type: "type1" },
                        ],
                      },
                    ],
                  },
                ],
              });
            });

            it(`pause_capturingと${resumeKeyword}の間にscreen_transitionがある場合`, () => {
              const testSteps: TestStepForSequenceView[] = [
                {
                  ...testStepBase,
                  id: "ts1",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts2",
                  operation: {
                    ...operationBase,
                    type: "pause_capturing",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts3",
                  operation: {
                    ...operationBase,
                    type: "screen_transition",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts4",
                  operation: {
                    ...operationBase,
                    type: resumeKeyword,
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts5",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
              ];

              const testResultId = "testResult1";

              const result = generateSequenceView(testResultId, testSteps);

              expect(result).toEqual({
                testResultId,
                windows: [{ id: "w1", name: "window1" }],
                screens: [{ id: "s0", name: "画面A" }],
                scenarios: [
                  {
                    nodes: [
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          { ...expectedTestStepBase, id: "ts1", type: "type1" },
                          {
                            ...expectedTestStepBase,
                            id: "ts2",
                            type: "pause_capturing",
                          },
                        ],
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [],
                        disabled: true,
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          {
                            ...expectedTestStepBase,
                            id: "ts3",
                            type: "screen_transition",
                          },
                        ],
                        disabled: true,
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          {
                            ...expectedTestStepBase,
                            id: "ts4",
                            type: resumeKeyword,
                          },
                          { ...expectedTestStepBase, id: "ts5", type: "type1" },
                        ],
                      },
                    ],
                  },
                ],
              });
            });

            it(`pause_capturingと${resumeKeyword}の間にscreen_transition以外のテストステップがある場合`, () => {
              const testSteps: TestStepForSequenceView[] = [
                {
                  ...testStepBase,
                  id: "ts1",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts2",
                  operation: {
                    ...operationBase,
                    type: "pause_capturing",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts3",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts4",
                  operation: {
                    ...operationBase,
                    type: resumeKeyword,
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
                {
                  ...testStepBase,
                  id: "ts5",
                  operation: {
                    ...operationBase,
                    type: "type1",
                    windowHandle: "w1",
                  },
                  screenDef: "画面A",
                },
              ];

              const testResultId = "testResult1";

              const result = generateSequenceView(testResultId, testSteps);

              expect(result).toEqual({
                testResultId,
                windows: [{ id: "w1", name: "window1" }],
                screens: [{ id: "s0", name: "画面A" }],
                scenarios: [
                  {
                    nodes: [
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          { ...expectedTestStepBase, id: "ts1", type: "type1" },
                          {
                            ...expectedTestStepBase,
                            id: "ts2",
                            type: "pause_capturing",
                          },
                        ],
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          { ...expectedTestStepBase, id: "ts3", type: "type1" },
                        ],
                        disabled: true,
                      },
                      {
                        windowId: "w1",
                        screenId: "s0",
                        testSteps: [
                          {
                            ...expectedTestStepBase,
                            id: "ts4",
                            type: resumeKeyword,
                          },
                          { ...expectedTestStepBase, id: "ts5", type: "type1" },
                        ],
                      },
                    ],
                  },
                ],
              });
            });
          }
        );
      });
    });
  });
});
