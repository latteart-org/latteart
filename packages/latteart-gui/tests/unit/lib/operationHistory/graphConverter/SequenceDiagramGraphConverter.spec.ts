/* tslint:disable:max-line-length */

import { convertToSequenceDiagramGraphs } from "@/lib/operationHistory/graphConverter/SequenceDiagramGraphConverter";

describe("SequenceDiagramGraphConverter", () => {
  it("sequenceViewのscreensが空の場合はgraphを生成しない", async () => {
    const view = {
      windows: [],
      screens: [],
      scenarios: [
        {
          nodes: [
            {
              windowId: "",
              screenId: "",
              testSteps: [
                {
                  id: "ts0",
                  type: "type1",
                  notes: [],
                },
              ],
            },
          ],
        },
        {
          testPurpose: { id: "p0", value: "intention1" },
          nodes: [
            {
              windowId: "",
              screenId: "",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  notes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const scenarios = await convertToSequenceDiagramGraphs(view);

    expect(scenarios[0].sequence).toEqual(1);
    expect(scenarios[0].testPurpose).toBeUndefined();
    expect(scenarios[0].graph).toBeUndefined();
    expect(scenarios[1].sequence).toEqual(2);
    expect(scenarios[1].testPurpose).toEqual({ value: "intention1" });
    expect(scenarios[1].graph).toBeUndefined();
  });

  it("先頭のシナリオに目的がなく、2つ目以降のシナリオに目的がある場合", async () => {
    const view = {
      windows: [{ id: "w0", name: "window1-text" }],
      screens: [{ id: "s0", name: "screenDef1" }],
      scenarios: [
        {
          nodes: [
            {
              windowId: "w0",
              screenId: "s0",
              testSteps: [
                {
                  id: "ts0",
                  type: "type1",
                  notes: [],
                },
              ],
            },
          ],
        },
        {
          testPurpose: { id: "p0", value: "intention1" },
          nodes: [
            {
              windowId: "w0",
              screenId: "s0",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  notes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const scenarios = await convertToSequenceDiagramGraphs(view);

    expect(scenarios[0].sequence).toEqual(1);
    expect(scenarios[0].testPurpose).toEqual(undefined);
    expect(scenarios[0].graph?.graphText).toEqual(
      `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
    );
    expect(scenarios[1].sequence).toEqual(2);
    expect(scenarios[1].testPurpose).toEqual({ value: "intention1" });
    expect(scenarios[1].graph?.graphText).toEqual(
      `sequenceDiagram;
participant s0 as screenDef1;
opt (2)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
    );
  });

  describe("無効なノードが存在する場合", () => {
    it("無効なノードへの行き来を示すエッジを表示する", async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [{ id: "s0", name: "screenDef1" }],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [{ id: "ts0", type: "type1", notes: [] }],
              },
              { windowId: "w0", screenId: "s0", testSteps: [], disabled: true },
              { windowId: "w0", screenId: "s0", testSteps: [] },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
s0 --x s0: ;
deactivate s0;
activate s0;
s0 --x s0: ;
deactivate s0;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
      );
    });

    it("無効なノードから別画面の無効なノードに遷移する場合は不明な画面遷移を示すエッジを表示する", async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [{ id: "ts0", type: "type1", notes: [] }],
              },
              { windowId: "w0", screenId: "s0", testSteps: [], disabled: true },
              { windowId: "w0", screenId: "s1", testSteps: [], disabled: true },
              { windowId: "w0", screenId: "s1", testSteps: [] },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 --x s0: ;
deactivate s0;
activate s0;
s0 ->> s1: screen transition;
deactivate s0;
activate s1;
s1 --x s1: ;
deactivate s1;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });
  });

  it("同一シナリオ内でウィンドウが切り替わった場合", async () => {
    const view = {
      windows: [
        { id: "w0", name: "window1-text" },
        { id: "w1", name: "window2-text" },
      ],
      screens: [{ id: "s0", name: "screenDef1" }],
      scenarios: [
        {
          testPurpose: { id: "p0", value: "intention1" },
          nodes: [
            {
              windowId: "w0",
              screenId: "s0",
              testSteps: [
                {
                  id: "ts0",
                  type: "type1",
                  notes: [],
                },
              ],
            },
            {
              windowId: "w1",
              screenId: "s0",
              testSteps: [
                {
                  id: "ts1",
                  type: "type1",
                  notes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const scenarios = await convertToSequenceDiagramGraphs(view);

    expect(scenarios[0].sequence).toEqual(1);
    expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
    expect(scenarios[0].graph?.graphText).toEqual(
      `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
s0 --x s0: ;
deactivate s0;
end;
opt (2)window2-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
    );
  });

  describe("convertが呼ばれた場合、screenHistoryをMermaidのシーケンス図形式の文字列に変換して返す", () => {
    describe("1画面内かつ1オペレーション内でのバリエーション", () => {
      it("同一オペレーション内に目的、バグ、気づき全てなし", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的のみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内にバグのみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [{ id: "n0", value: "bug1", tags: ["bug"] }],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に気づきのみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [{ id: "n0", value: "notice1", tags: [] }],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内にタグ付きの気づきのみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [
                        { id: "n0", value: "notice1", tags: ["tag1", "tag2"] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[tag1][tag2<br/>]<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的とバグのみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [{ id: "n0", value: "bug1", tags: ["bug"] }],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的と気づきのみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [{ id: "n0", value: "notice1", tags: [] }],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内にバグと気づきのみあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [
                        { id: "n0", value: "bug1", tags: ["bug"] },
                        { id: "n1", value: "notice1", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-1)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的とバグと気づき全てあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [
                        { id: "n0", value: "bug1", tags: ["bug"] },
                        { id: "n1", value: "notice1", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-1)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });
    });

    describe("1画面内かつ別オペレーションに紐づくノートあり", () => {
      it("同一オペレーション内に目的とバグと気づき全てあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [
                        { id: "n0", value: "bug1", tags: ["bug"] },
                        { id: "n1", value: "notice1", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              testPurpose: { id: "p1", value: "intention2" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts1",
                      type: "type2",
                      notes: [
                        { id: "n2", value: "bug2", tags: ["bug"] },
                        { id: "n3", value: "notice2", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-1)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
        expect(scenarios[1].sequence).toEqual(2);
        expect(scenarios[1].testPurpose).toEqual({ value: "intention2" });
        expect(scenarios[1].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (2)window1-text;
activate s0;
Note right of s0: (2-0)[bug]<br/>-<br/>bug2;
Note right of s0: (2-1)<br/>-<br/>notice2;
deactivate s0;
end;
`
        );
      });

      it("最後以外の目的の範囲内にバグも気づきもないケース", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      notes: [],
                    },
                  ],
                },
              ],
            },
            {
              testPurpose: { id: "p1", value: "intention2" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts1",
                      type: "type2",
                      notes: [
                        { id: "n2", value: "bug2", tags: ["bug"] },
                        { id: "n3", value: "notice2", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
        );
        expect(scenarios[1].sequence).toEqual(2);
        expect(scenarios[1].testPurpose).toEqual({ value: "intention2" });
        expect(scenarios[1].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (2)window1-text;
activate s0;
Note right of s0: (2-0)[bug]<br/>-<br/>bug2;
Note right of s0: (2-1)<br/>-<br/>notice2;
deactivate s0;
end;
`
        );
      });
    });

    describe("画面遷移ありで画面遷移したのちに最初の画面に戻ってくるパターン", () => {
      it("全ての画面に目的、バグ、気づきありでそれぞれ同一オペレーション内に目的とバグと気づき全てあり", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [
            { id: "s0", name: "screenDef1" },
            { id: "s1", name: "screenDef2" },
          ],
          scenarios: [
            {
              testPurpose: { id: "p0", value: "intention1" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      element: {
                        xpath: "",
                        tagname: "",
                        text: "elementValue1",
                      },
                      notes: [
                        { id: "n0", value: "bug1", tags: ["bug"] },
                        { id: "n1", value: "notice1", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              testPurpose: { id: "p1", value: "intention2" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s1",
                  testSteps: [
                    {
                      id: "ts1",
                      type: "type2",
                      element: {
                        xpath: "",
                        tagname: "",
                        text: "elementValue2",
                      },
                      notes: [
                        { id: "n2", value: "bug2", tags: ["bug"] },
                        { id: "n3", value: "notice2", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              testPurpose: { id: "p2", value: "intention3" },
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts2",
                      type: "type3",
                      element: {
                        xpath: "",
                        tagname: "",
                        text: "elementValue3",
                      },
                      notes: [
                        { id: "n4", value: "bug3", tags: ["bug"] },
                        { id: "n5", value: "notice3", tags: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-1)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
        expect(scenarios[1].sequence).toEqual(2);
        expect(scenarios[1].testPurpose).toEqual({ value: "intention2" });
        expect(scenarios[1].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s1 as screenDef2;
opt (2)window1-text;
activate s1;
Note right of s1: (2-0)[bug]<br/>-<br/>bug2;
Note right of s1: (2-1)<br/>-<br/>notice2;
deactivate s1;
end;
`
        );
        expect(scenarios[2].sequence).toEqual(3);
        expect(scenarios[2].testPurpose).toEqual({ value: "intention3" });
        expect(scenarios[2].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (3)window1-text;
activate s0;
Note right of s0: (3-0)[bug]<br/>-<br/>bug3;
Note right of s0: (3-1)<br/>-<br/>notice3;
deactivate s0;
end;
`
        );
      });
    });

    describe("自画面遷移の場合", () => {
      it("同一画面に対してエッジを張る", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [{ id: "s0", name: "screenDef1" }],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "type1",
                      element: {
                        xpath: "",
                        tagname: "",
                        text: "elementValue1",
                      },
                      notes: [],
                    },
                  ],
                },
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts1",
                      type: "type2",
                      notes: [],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
s0 ->> s0: (1)type1: elementValue1;
deactivate s0;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
        );
      });
    });

    describe("画面遷移した直後に操作を介さずに再度画面遷移した場合", () => {
      it("画面遷移時のエッジにはscreen_transitionを表示して対応する要素は空白として表示する", async () => {
        const view = {
          windows: [{ id: "w0", name: "window1-text" }],
          screens: [
            { id: "s0", name: "screenDef1" },
            { id: "s1", name: "screenDef2" },
          ],
          scenarios: [
            {
              nodes: [
                {
                  windowId: "w0",
                  screenId: "s0",
                  testSteps: [
                    {
                      id: "ts0",
                      type: "screen_transition",
                      notes: [],
                    },
                  ],
                },
                {
                  windowId: "w0",
                  screenId: "s1",
                  testSteps: [
                    {
                      id: "ts1",
                      type: "type2",
                      notes: [],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const scenarios = await convertToSequenceDiagramGraphs(view);

        expect(scenarios[0].sequence).toEqual(1);
        expect(scenarios[0].testPurpose).toEqual(undefined);
        expect(scenarios[0].graph?.graphText).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)screen_transition: ;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
        );
      });
    });
  });

  describe("画面ノードが表示されているとき", () => {
    it("画面ノードの文言を改行した上、一定文字数に達したら以降省略して表示する", async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [
          {
            id: "s0",
            name: "hogehogehugahugapiyopiyofoobarhogehogehugahugapiyopiyo",
          },
        ],
        scenarios: [
          {
            testPurpose: { id: "p0", value: "intention1" },
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual({ value: "intention1" });
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as hogehogehugahug<br/>apiyopiyofoobar<br/>hogehogehugahug<br/>...;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
      );
    });
  });

  describe("シーケンス図にバグや気づきのノートが表示されているとき", () => {
    it("ノートの文言は16文字(2バイト文字は2文字とカウント)毎に改行して表示する", async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [{ id: "s0", name: "screenDef1" }],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    notes: [
                      {
                        id: "n0",
                        value: "bug1bug1バグ1バグ1bug1bug1",
                        tags: ["bug"],
                      },
                      { id: "n1", value: "notice1notice1気づき1not", tags: [] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1bug1バグ1バ<br/>グ1bug1bug1;
Note right of s0: (1-1)<br/>-<br/>notice1notice1気<br/>づき1not;
deactivate s0;
end;
`
      );
    });
  });

  describe("シーケンス図に画面遷移を示す矢印が表示されているとき", () => {
    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に改行が含まれる場合は改行を半角スペースに変換して表示する", async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "element\r\nValue1",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w0",
                screenId: "s1",
                testSteps: [
                  {
                    id: "ts1",
                    type: "type2",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: element Value1;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });

    it('エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に「#;<>"」が含まれる場合は数値文字参照変換して表示する', async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: 'aa##;;<<>>""aa',
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w0",
                screenId: "s1",
                testSteps: [
                  {
                    id: "ts1",
                    type: "type2",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: aa#35;#35;#59;#59;#60;#60;#62;#62;#34;#34;aa;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });

    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値が20文字より大きい場合、省略した上で末尾に...を表示する", async () => {
      const view = {
        windows: [{ id: "w0", name: "window1-text" }],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "aaaaaaaaaaaaaaaaaaaaa",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w0",
                screenId: "s1",
                testSteps: [
                  {
                    id: "ts1",
                    type: "type2",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: aaaaaaaaaaaaaaaaaaaa...;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });
  });

  describe("タブ切り替えが行われたとき", () => {
    it("タブ切り替え後に表示するものが有る場合、問題なしが表示されない", async () => {
      const view = {
        windows: [
          { id: "w0", name: "window1-text" },
          { id: "w1", name: "window2-text" },
        ],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "elementValue1",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w1",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts1",
                    type: "type2",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "elementValue2",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w1",
                screenId: "s1",
                testSteps: [
                  {
                    id: "ts2",
                    type: "type3",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 --x s0: ;
deactivate s0;
end;
opt (2)window2-text;
activate s0;
s0 ->> s1: (2)type2: elementValue2;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });

    it("タブ切り替え後に表示するものが無い場合、問題なしが表示される", async () => {
      const view = {
        windows: [
          { id: "w0", name: "window1-text" },
          { id: "w1", name: "window2-text" },
        ],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
          { id: "s2", name: "screenDef3" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "elementValue1",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w0",
                screenId: "s1",
                testSteps: [
                  {
                    id: "ts1",
                    type: "type2",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "elementValue2",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w1",
                screenId: "s2",
                testSteps: [
                  {
                    id: "ts2",
                    type: "type3",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
participant s2 as screenDef3;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: elementValue1;
deactivate s0;
activate s1;
s1 --x s1: ;
deactivate s1;
end;
opt (3)window2-text;
activate s2;
Note left of s2: DUMMY_COMMENT;
deactivate s2;
end;
`
      );
    });

    it("目的とタブ切り替えが同時に行われたとき", async () => {
      const view = {
        windows: [
          { id: "w0", name: "window1-text" },
          { id: "w1", name: "window2-text" },
        ],
        screens: [
          { id: "s0", name: "screenDef1" },
          { id: "s1", name: "screenDef2" },
        ],
        scenarios: [
          {
            nodes: [
              {
                windowId: "w0",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts0",
                    type: "type1",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "elementValue1",
                    },
                    notes: [],
                  },
                ],
              },
              {
                windowId: "w0",
                screenId: "s1",
                testSteps: [
                  {
                    id: "ts1",
                    type: "type2",
                    element: {
                      xpath: "",
                      tagname: "",
                      text: "elementValue2",
                    },
                    notes: [],
                  },
                ],
              },
            ],
          },
          {
            testPurpose: { id: "p0", value: "intention1" },
            nodes: [
              {
                windowId: "w1",
                screenId: "s0",
                testSteps: [
                  {
                    id: "ts2",
                    type: "type3",
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const scenarios = await convertToSequenceDiagramGraphs(view);

      expect(scenarios[0].sequence).toEqual(1);
      expect(scenarios[0].testPurpose).toEqual(undefined);
      expect(scenarios[0].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: elementValue1;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );

      expect(scenarios[1].sequence).toEqual(3);
      expect(scenarios[1].testPurpose).toEqual({ value: "intention1" });
      expect(scenarios[1].graph?.graphText).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
opt (3)window2-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
      );
    });
  });
});
