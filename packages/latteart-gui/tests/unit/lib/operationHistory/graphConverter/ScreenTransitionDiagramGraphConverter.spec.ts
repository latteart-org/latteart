/* tslint:disable:max-line-length */

import { convertToScreenTransitionDiagramGraph } from "@/lib/operationHistory/graphConverter/ScreenTransitionDiagramGraphConverter";

describe("convertToScreenTransitionDiagramGraph", () => {
  describe("GraphViewモデルを元に画面遷移図を生成する", () => {
    describe("画面遷移なし", () => {
      it("画面A", async () => {
        const view = {
          nodes: [
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
          ],
          store: {
            windows: [{ id: "w1", name: "ウィンドウ1" }],
            screens: [{ id: "s1", name: "画面A", elementIds: [] }],
            elements: [],
            testPurposes: [],
            notes: [],
          },
        };

        const graphs = await convertToScreenTransitionDiagramGraph(view);
        const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
          .graphText;

        expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
`);
      });
    });

    describe("他画面遷移", () => {
      it("画面A → 画面B → 画面C", async () => {
        const view = {
          nodes: [
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  targetElementId: "e1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts2",
                  type: "type2",
                  targetElementId: "e2",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s2",
              testSteps: [
                {
                  id: "ts3",
                  type: "type3",
                  targetElementId: "e3",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts4",
                  type: "type4",
                  targetElementId: "e4",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s3",
              testSteps: [
                {
                  id: "ts5",
                  type: "type5",
                  targetElementId: "e5",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts6",
                  type: "type6",
                  targetElementId: "e6",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
          ],
          store: {
            windows: [{ id: "w1", name: "ウィンドウ1" }],
            screens: [
              { id: "s1", name: "画面A", elementIds: [] },
              { id: "s2", name: "画面B", elementIds: [] },
              { id: "s3", name: "画面C", elementIds: [] },
            ],
            elements: [
              {
                id: "e1",
                xpath: "",
                tagname: "",
                text: "要素1",
                attributes: {},
              },
              {
                id: "e2",
                xpath: "",
                tagname: "",
                text: "要素2",
                attributes: {},
              },
              {
                id: "e3",
                xpath: "",
                tagname: "",
                text: "要素3",
                attributes: {},
              },
              {
                id: "e4",
                xpath: "",
                tagname: "",
                text: "要素4",
                attributes: {},
              },
              {
                id: "e5",
                xpath: "",
                tagname: "",
                text: "要素5",
                attributes: {},
              },
              {
                id: "e6",
                xpath: "",
                tagname: "",
                text: "要素6",
                attributes: {},
              },
            ],
            testPurposes: [],
            notes: [],
          },
        };

        const graphs = await convertToScreenTransitionDiagramGraph(view);
        const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
          .graphText;

        expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s2["画面B"];
s3["画面C"];
s1 --> |"type2: 要素2"|s2;
s2 --> |"type4: 要素4"|s3;
`);
      });
    });

    describe("他画面遷移して戻る", () => {
      it("画面A → 画面B → 画面A", async () => {
        const view = {
          nodes: [
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  targetElementId: "e1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts2",
                  type: "type2",
                  targetElementId: "e2",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s2",
              testSteps: [
                {
                  id: "ts3",
                  type: "type3",
                  targetElementId: "e3",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts4",
                  type: "type4",
                  targetElementId: "e4",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [],
              defaultValues: [],
            },
          ],
          store: {
            windows: [{ id: "w1", name: "ウィンドウ1" }],
            screens: [
              { id: "s1", name: "画面A", elementIds: [] },
              { id: "s2", name: "画面B", elementIds: [] },
            ],
            elements: [
              {
                id: "e1",
                xpath: "",
                tagname: "",
                text: "要素1",
                attributes: {},
              },
              {
                id: "e2",
                xpath: "",
                tagname: "",
                text: "要素2",
                attributes: {},
              },
              {
                id: "e3",
                xpath: "",
                tagname: "",
                text: "要素3",
                attributes: {},
              },
              {
                id: "e4",
                xpath: "",
                tagname: "",
                text: "要素4",
                attributes: {},
              },
            ],
            testPurposes: [],
            notes: [],
          },
        };

        const graphs = await convertToScreenTransitionDiagramGraph(view);
        const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
          .graphText;

        expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s2["画面B"];
s1 --> |"type2: 要素2"|s2;
s2 --> |"type4: 要素4"|s1;
`);
      });
    });

    describe("遷移元画面、遷移先画面、画面遷移契機の全てが同じものは同じ画面遷移とみなす", () => {
      it("画面A → 画面B → 画面A -> 画面B", async () => {
        const view = {
          nodes: [
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  targetElementId: "e1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s2",
              testSteps: [],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts2",
                  type: "type1",
                  targetElementId: "e1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s2",
              testSteps: [],
              defaultValues: [],
            },
          ],
          store: {
            windows: [{ id: "w1", name: "ウィンドウ1" }],
            screens: [
              { id: "s1", name: "画面A", elementIds: [] },
              { id: "s2", name: "画面B", elementIds: [] },
            ],
            elements: [
              {
                id: "e1",
                xpath: "",
                tagname: "",
                text: "要素1",
                attributes: {},
              },
            ],
            testPurposes: [],
            notes: [],
          },
        };

        const graphs = await convertToScreenTransitionDiagramGraph(view);
        const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
          .graphText;

        expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s2["画面B"];
s1 --> |"type1: 要素1"|s2;
s2 --> |"screen transition"|s1;
`);
      });
    });

    describe("遷移元画面、遷移先画面が同じでも画面遷移契機が異なるものは別の画面遷移とみなす", () => {
      describe("画面A → 画面B → 画面A -> 画面B", () => {
        it.each`
          trigger1                                                         | trigger2
          ${{ type: "type1", targetElement: { id: "e1", text: "要素1" } }} | ${{ type: "type1", targetElement: { id: "e2", text: "要素2" } }}
          ${{ type: "type1", targetElement: { id: "e1", text: "要素1" } }} | ${{ type: "type2", targetElement: { id: "e1", text: "要素1" } }}
          ${{ type: "type1", targetElement: { id: "e1", text: "要素1" } }} | ${{ type: "type2", targetElement: { id: "e2", text: "要素2" } }}
        `(
          "画面遷移契機1: { 操作種別: $trigger1.type, 対象要素: $trigger1.targetElement.text }, 画面遷移契機2: { 操作種別: $trigger2.type, 対象要素: $trigger2.targetElement.text }",
          async ({ trigger1, trigger2 }) => {
            const view = {
              nodes: [
                {
                  windowId: "w1",
                  screenId: "s1",
                  testSteps: [
                    {
                      id: "ts1",
                      type: trigger1.type,
                      targetElementId: trigger1.targetElement.id,
                      noteIds: [],
                      pageUrl: "",
                      pageTitle: "",
                    },
                  ],
                  defaultValues: [],
                },
                {
                  windowId: "w1",
                  screenId: "s2",
                  testSteps: [],
                  defaultValues: [],
                },
                {
                  windowId: "w1",
                  screenId: "s1",
                  testSteps: [
                    {
                      id: "ts2",
                      type: trigger2.type,
                      targetElementId: trigger2.targetElement.id,
                      noteIds: [],
                      pageUrl: "",
                      pageTitle: "",
                    },
                  ],
                  defaultValues: [],
                },
                {
                  windowId: "w1",
                  screenId: "s2",
                  testSteps: [],
                  defaultValues: [],
                },
              ],
              store: {
                windows: [{ id: "w1", name: "ウィンドウ1" }],
                screens: [
                  { id: "s1", name: "画面A", elementIds: [] },
                  { id: "s2", name: "画面B", elementIds: [] },
                ],
                elements: [
                  {
                    id: trigger1.targetElement.id,
                    xpath: "",
                    tagname: "",
                    text: trigger1.targetElement.text,
                    attributes: {},
                  },
                  {
                    id: trigger2.targetElement.id,
                    xpath: "",
                    tagname: "",
                    text: trigger2.targetElement.text,
                    attributes: {},
                  },
                ],
                testPurposes: [],
                notes: [],
              },
            };

            const graphs = await convertToScreenTransitionDiagramGraph(view);
            const graphText = graphs.find(({ window }) => window.id === "w1")
              ?.graph.graphText;

            expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s2["画面B"];
s1 --> |"${trigger1.type}: ${trigger1.targetElement.text}"|s2;
s2 --> |"screen transition"|s1;
s1 --> |"${trigger2.type}: ${trigger2.targetElement.text}"|s2;
`);
          }
        );
      });
    });

    describe("同一画面遷移", () => {
      it("画面A → 画面A", async () => {
        const view = {
          nodes: [
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  targetElementId: "e1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts2",
                  type: "type2",
                  targetElementId: "e2",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [
                {
                  id: "ts3",
                  type: "type3",
                  targetElementId: "e3",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts4",
                  type: "type4",
                  targetElementId: "e4",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
          ],
          store: {
            windows: [{ id: "w1", name: "ウィンドウ1" }],
            screens: [{ id: "s1", name: "画面A", elementIds: [] }],
            elements: [
              {
                id: "e1",
                xpath: "",
                tagname: "",
                text: "要素1",
                attributes: {},
              },
              {
                id: "e2",
                xpath: "",
                tagname: "",
                text: "要素2",
                attributes: {},
              },
              {
                id: "e3",
                xpath: "",
                tagname: "",
                text: "要素3",
                attributes: {},
              },
              {
                id: "e4",
                xpath: "",
                tagname: "",
                text: "要素4",
                attributes: {},
              },
            ],
            testPurposes: [],
            notes: [],
          },
        };

        const graphs = await convertToScreenTransitionDiagramGraph(view);
        const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
          .graphText;

        expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s1 --> |"type2: 要素2"|s1;
`);
      });
    });

    describe("操作なしで遷移した場合", () => {
      it("画面A → 画面B", async () => {
        const view = {
          nodes: [
            {
              windowId: "w1",
              screenId: "s1",
              testSteps: [],
              defaultValues: [],
            },
            {
              windowId: "w1",
              screenId: "s2",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  targetElementId: "e1",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
                {
                  id: "ts2",
                  type: "type2",
                  targetElementId: "e2",
                  noteIds: [],
                  pageUrl: "",
                  pageTitle: "",
                },
              ],
              defaultValues: [],
            },
          ],
          store: {
            windows: [{ id: "w1", name: "ウィンドウ1" }],
            screens: [
              { id: "s1", name: "画面A", elementIds: [] },
              { id: "s2", name: "画面B", elementIds: [] },
            ],
            elements: [
              {
                id: "e1",
                xpath: "",
                tagname: "",
                text: "要素1",
                attributes: {},
              },
              {
                id: "e2",
                xpath: "",
                tagname: "",
                text: "要素2",
                attributes: {},
              },
            ],
            testPurposes: [],
            notes: [],
          },
        };

        const graphs = await convertToScreenTransitionDiagramGraph(view);
        const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
          .graphText;

        expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s2["画面B"];
s1 --> |"screen transition"|s2;
`);
      });
    });
  });

  describe("画面遷移図にエッジが表示されているとき", () => {
    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に改行が含まれる場合は改行を半角スペースに変換して表示する", async () => {
      const view = {
        nodes: [
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [
              {
                id: "ts1",
                type: "type1",
                targetElementId: "e1",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [],
            defaultValues: [],
          },
        ],
        store: {
          windows: [{ id: "w1", name: "ウィンドウ1" }],
          screens: [{ id: "s1", name: "画面A", elementIds: [] }],
          elements: [
            {
              id: "e1",
              xpath: "",
              tagname: "",
              text: "aaa\nbbb",
              attributes: {},
            },
          ],
          testPurposes: [],
          notes: [],
        },
      };

      const graphs = await convertToScreenTransitionDiagramGraph(view);
      const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
        .graphText;

      expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s1 --> |"type1: aaa bbb"|s1;
`);
    });

    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値が20文字より大きい場合、省略した上で末尾に...を表示する", async () => {
      const view = {
        nodes: [
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [
              {
                id: "ts1",
                type: "type1",
                targetElementId: "e1",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [],
            defaultValues: [],
          },
        ],
        store: {
          windows: [{ id: "w1", name: "ウィンドウ1" }],
          screens: [{ id: "s1", name: "画面A", elementIds: [] }],
          elements: [
            {
              id: "e1",
              xpath: "",
              tagname: "",
              text: "aaaaaaaaaaaaaaaaaaaaa",
              attributes: {},
            },
          ],
          testPurposes: [],
          notes: [],
        },
      };

      const graphs = await convertToScreenTransitionDiagramGraph(view);
      const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
        .graphText;

      expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s1 --> |"type1: aaaaaaaaaaaaaaaaaaaa..."|s1;
`);
    });

    it('エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に「#;<>"」が含まれる場合は数値文字参照変換して表示する', async () => {
      const view = {
        nodes: [
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [
              {
                id: "ts1",
                type: "type1",
                targetElementId: "e1",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [],
            defaultValues: [],
          },
        ],
        store: {
          windows: [{ id: "w1", name: "ウィンドウ1" }],
          screens: [{ id: "s1", name: "画面A", elementIds: [] }],
          elements: [
            {
              id: "e1",
              xpath: "",
              tagname: "",
              text: 'aa##;;<<>>""aa',
              attributes: {},
            },
          ],
          testPurposes: [],
          notes: [],
        },
      };

      const graphs = await convertToScreenTransitionDiagramGraph(view);
      const graphText = graphs.find(({ window }) => window.id === "w1")?.graph
        .graphText;

      expect(graphText).toEqual(`\
graph TD;
s1["画面A"];
s1 --> |"type1: aa#35;#35;#59;#59;#60;#60;#62;#62;#34;#34;aa"|s1;
`);
    });
  });

  describe("タブを切り替えたとき", () => {
    it("ウィンドウ1 -> ウィンドウ2 -> ウィンドウ1 -> ウィンドウ3", async () => {
      const view = {
        nodes: [
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [
              {
                id: "ts1",
                type: "type1",
                targetElementId: "e1",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w2",
            screenId: "s2",
            testSteps: [
              {
                id: "ts2",
                type: "type2",
                targetElementId: "e2",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [
              {
                id: "ts3",
                type: "type3",
                targetElementId: "e3",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w3",
            screenId: "s3",
            testSteps: [
              {
                id: "ts4",
                type: "type4",
                targetElementId: "e4",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
        ],
        store: {
          windows: [
            { id: "w1", name: "ウィンドウ1" },
            { id: "w2", name: "ウィンドウ2" },
            { id: "w3", name: "ウィンドウ3" },
          ],
          screens: [
            { id: "s1", name: "画面A", elementIds: [] },
            { id: "s2", name: "画面B", elementIds: [] },
            { id: "s3", name: "画面C", elementIds: [] },
          ],
          elements: [
            { id: "e1", xpath: "", tagname: "", text: "要素1", attributes: {} },
            { id: "e2", xpath: "", tagname: "", text: "要素2", attributes: {} },
            { id: "e3", xpath: "", tagname: "", text: "要素3", attributes: {} },
            { id: "e4", xpath: "", tagname: "", text: "要素4", attributes: {} },
          ],
          testPurposes: [],
          notes: [],
        },
      };

      const graphs = await convertToScreenTransitionDiagramGraph(view);

      expect(graphs.find(({ window }) => window.id === "w1")?.graph.graphText)
        .toEqual(`\
graph TD;
s1["画面A"];
`);

      expect(graphs.find(({ window }) => window.id === "w2")?.graph.graphText)
        .toEqual(`\
graph TD;
s2["画面B"];
`);

      expect(graphs.find(({ window }) => window.id === "w3")?.graph.graphText)
        .toEqual(`\
graph TD;
s3["画面C"];
`);
    });

    it("ウィンドウ1[画面A] -> ウィンドウ1[画面B] -> ウィンドウ2[画面C] -> ウィンドウ2[画面D] -> ウィンドウ1[画面E] -> ウィンドウ1[画面E]", async () => {
      const view = {
        nodes: [
          {
            windowId: "w1",
            screenId: "s1",
            testSteps: [
              {
                id: "ts1",
                type: "type1",
                targetElementId: "e1",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s2",
            testSteps: [
              {
                id: "ts2",
                type: "type2",
                targetElementId: "e2",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w2",
            screenId: "s3",
            testSteps: [
              {
                id: "ts3",
                type: "type3",
                targetElementId: "e3",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w2",
            screenId: "s4",
            testSteps: [
              {
                id: "ts4",
                type: "type4",
                targetElementId: "e4",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s5",
            testSteps: [
              {
                id: "ts5",
                type: "type5",
                targetElementId: "e5",
                noteIds: [],
                pageUrl: "",
                pageTitle: "",
              },
            ],
            defaultValues: [],
          },
          {
            windowId: "w1",
            screenId: "s5",
            testSteps: [],
            defaultValues: [],
          },
        ],
        store: {
          windows: [
            { id: "w1", name: "ウィンドウ1" },
            { id: "w2", name: "ウィンドウ2" },
          ],
          screens: [
            { id: "s1", name: "画面A", elementIds: [] },
            { id: "s2", name: "画面B", elementIds: [] },
            { id: "s3", name: "画面C", elementIds: [] },
            { id: "s4", name: "画面D", elementIds: [] },
            { id: "s5", name: "画面E", elementIds: [] },
          ],
          elements: [
            { id: "e1", xpath: "", tagname: "", text: "要素1", attributes: {} },
            { id: "e2", xpath: "", tagname: "", text: "要素2", attributes: {} },
            { id: "e3", xpath: "", tagname: "", text: "要素3", attributes: {} },
            { id: "e4", xpath: "", tagname: "", text: "要素4", attributes: {} },
            { id: "e5", xpath: "", tagname: "", text: "要素5", attributes: {} },
          ],
          testPurposes: [],
          notes: [],
        },
      };

      const graphs = await convertToScreenTransitionDiagramGraph(view);

      expect(graphs.find(({ window }) => window.id === "w1")?.graph.graphText)
        .toEqual(`\
graph TD;
s1["画面A"];
s2["画面B"];
s5["画面E"];
s1 --> |"type1: 要素1"|s2;
s5 --> |"type5: 要素5"|s5;
`);

      expect(graphs.find(({ window }) => window.id === "w2")?.graph.graphText)
        .toEqual(`\
graph TD;
s3["画面C"];
s4["画面D"];
s3 --> |"type3: 要素3"|s4;
`);
    });
  });
});
