import {
  generateSequenceView,
  SequenceView,
  TestStepForSequenceView,
} from "@/domain/sequenceViewGeneration";

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

        const result = generateSequenceView(testSteps);

        expect(result).toEqual({
          windows: [],
          screens: [],
          scenarios: [],
        });
      });

      it("1つ目のテストステップに目的がある場合", () => {
        const result: SequenceView = generateSequenceView([
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

        const result: SequenceView = generateSequenceView(testSteps);

        expect(result).toEqual({
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

        const result: SequenceView = generateSequenceView(testSteps);

        expect(result).toEqual({
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
  });
});
