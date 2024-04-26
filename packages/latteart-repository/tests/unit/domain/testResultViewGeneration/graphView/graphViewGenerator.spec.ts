import {
  ElementMapperFactory,
  generateGraphView,
  IdGenerator,
  TestStepForGraphView,
} from "@/domain/testResultViewGeneration/graphView";
import { ElementInfo } from "@/domain/types";

describe("ElementMapper", () => {
  let idGenerator: Pick<IdGenerator, "generateElementId">;

  beforeEach(() => {
    idGenerator = (() => {
      let count = 0;
      return {
        generateElementId() {
          return `element${++count}`;
        },
      };
    })();
  });

  describe("#findElement", () => {
    describe("保有する要素群から指定のURL、タイトル、xpathにマッチする画面要素を返す", () => {
      it("マッチする画面要素が見つかった場合はその要素を返す", () => {
        const mapperFactory = new ElementMapperFactory(idGenerator);

        const mapper = mapperFactory.create([
          {
            screenDef: "screenDef1",
            screenElements: [
              {
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath1",
                tagname: "",
                attributes: {},
              },
            ],
          },
        ]);

        const element = mapper.findElement("url1", "title1", "xpath1");

        expect(element).toEqual({
          id: "element1",
          pageUrl: "url1",
          pageTitle: "title1",
          xpath: "xpath1",
          tagname: "",
          text: "",
          attributes: {},
        });
      });

      it.each`
        url       | title       | xpath
        ${"url2"} | ${"title1"} | ${"xpath1"}
        ${"url1"} | ${"title2"} | ${"xpath1"}
        ${"url1"} | ${"title1"} | ${"xpath2"}
      `(
        "マッチする画面要素が見つからなかった場合はundefinedを返す $url $title $xpath",
        ({ url, title, xpath }) => {
          const mapperFactory = new ElementMapperFactory(idGenerator);

          const mapper = mapperFactory.create([
            {
              screenDef: "screenDef1",
              screenElements: [
                {
                  pageUrl: "url1",
                  pageTitle: "title1",
                  xpath: "xpath1",
                  tagname: "",
                  attributes: {},
                },
              ],
            },
          ]);

          const element = mapper.findElement(url, title, xpath);

          expect(element).toEqual(undefined);
        }
      );
    });
  });

  describe("#collectElements", () => {
    describe("保有する要素群を指定のフィルタ条件で絞り込んで返す", () => {
      it("フィルタ条件無し", () => {
        const mapperFactory = new ElementMapperFactory(idGenerator);

        const mapper = mapperFactory.create([
          {
            screenDef: "screenDef1",
            screenElements: [
              {
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath1",
                tagname: "",
                attributes: {},
              },
            ],
          },
          {
            screenDef: "screenDef1",
            screenElements: [
              {
                pageUrl: "url1",
                pageTitle: "title2",
                xpath: "xpath2",
                tagname: "",
                attributes: {},
              },
            ],
          },
          {
            screenDef: "screenDef2",
            screenElements: [
              {
                pageUrl: "url2",
                pageTitle: "title1",
                xpath: "xpath3",
                tagname: "",
                attributes: {},
              },
            ],
          },
        ]);

        const element = mapper.collectElements();

        expect(element).toEqual([
          {
            id: "element1",
            pageUrl: "url1",
            pageTitle: "title1",
            xpath: "xpath1",
            tagname: "",
            text: "",
            attributes: {},
          },
          {
            id: "element2",
            pageUrl: "url1",
            pageTitle: "title2",
            xpath: "xpath2",
            tagname: "",
            text: "",
            attributes: {},
          },
          {
            id: "element3",
            pageUrl: "url2",
            pageTitle: "title1",
            xpath: "xpath3",
            tagname: "",
            text: "",
            attributes: {},
          },
        ]);
      });

      it("screenDefでフィルタ", () => {
        const mapperFactory = new ElementMapperFactory(idGenerator);

        const mapper = mapperFactory.create([
          {
            screenDef: "screenDef1",
            screenElements: [
              {
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath1",
                tagname: "",
                attributes: {},
              },
            ],
          },
          {
            screenDef: "screenDef1",
            screenElements: [
              {
                pageUrl: "url1",
                pageTitle: "title2",
                xpath: "xpath2",
                tagname: "",
                attributes: {},
              },
            ],
          },
          {
            screenDef: "screenDef2",
            screenElements: [
              {
                pageUrl: "url2",
                pageTitle: "title1",
                xpath: "xpath3",
                tagname: "",
                attributes: {},
              },
            ],
          },
        ]);

        const element = mapper.collectElements({ screenDef: "screenDef1" });

        expect(element).toEqual([
          {
            id: "element1",
            pageUrl: "url1",
            pageTitle: "title1",
            xpath: "xpath1",
            tagname: "",
            text: "",
            attributes: {},
          },
          {
            id: "element2",
            pageUrl: "url1",
            pageTitle: "title2",
            xpath: "xpath2",
            tagname: "",
            text: "",
            attributes: {},
          },
        ]);
      });
    });
  });
});

describe("generateGraphView", () => {
  describe("指定のテストステップ群、カバレッジ算出元情報を元にGraphViewを生成する", () => {
    const testStepBase = {
      screenDef: "画面A",
      operation: {
        input: "",
        type: "type",
        windowHandle: "w1",
        url: "url1",
        title: "title1",
        elementInfo: null,
        inputElements: [],
      },
      intention: null,
      bugs: [],
      notices: [],
    };

    const coverageSourcesBase: {
      screenDef: string;
      screenElements: (ElementInfo & {
        pageUrl: string;
        pageTitle: string;
      })[];
    }[] = [
      {
        screenDef: "画面A",
        screenElements: [
          {
            tagname: "tagname1",
            xpath: "xpath1",
            text: "text1",
            attributes: {},
            pageUrl: "url1",
            pageTitle: "title1",
          },
          {
            tagname: "tagname2",
            xpath: "xpath2",
            text: "text2",
            attributes: {},
            pageUrl: "url1",
            pageTitle: "title1",
          },
        ],
      },
    ];

    function createIdGeneratorMock(): {
      generateScreenId: () => string;
      generateElementId: () => string;
    } {
      let screenCount = 0;
      let elementCount = 0;

      return {
        generateScreenId: jest.fn().mockImplementation(() => {
          return `s${++screenCount}`;
        }),
        generateElementId: jest.fn().mockImplementation(() => {
          return `e${++elementCount}`;
        }),
      };
    }

    const expectedStoreBase = {
      windows: [{ id: "w1", name: "window1" }],
      screens: [{ id: "s1", name: "画面A", elementIds: ["e1", "e2"] }],
      elements: [
        {
          id: "e1",
          pageUrl: "url1",
          pageTitle: "title1",
          xpath: "xpath1",
          tagname: "tagname1",
          text: "text1",
          attributes: {},
        },
        {
          id: "e2",
          pageUrl: "url1",
          pageTitle: "title1",
          xpath: "xpath2",
          tagname: "tagname2",
          text: "text2",
          attributes: {},
        },
      ],
      testPurposes: [],
      notes: [],
      radioGroup: [],
    };

    const expectedNodeBase = {
      windowId: "w1",
      screenId: "s1",
      testSteps: [],
      defaultValues: [],
    };

    const expectedTestStepBase = {
      input: "",
      type: "type",
      pageUrl: "url1",
      pageTitle: "title1",
      noteIds: [],
    };

    it("チェックボックスの操作をした際のGraphViewを生成する", () => {
      const testSteps: TestStepForGraphView[] = [
        {
          ...testStepBase,
          id: "ts1",
          operation: {
            ...testStepBase.operation,
            elementInfo: {
              tagname: "INPUT",
              xpath: "xpath",
              checked: true,
              attributes: { type: "checkbox" },
            },
          },
        },
      ];
      const coverageSources: {
        screenDef: string;
        screenElements: (ElementInfo & {
          pageUrl: string;
          pageTitle: string;
        })[];
      }[] = [];
      const idGenerator = createIdGeneratorMock();
      const graphView = generateGraphView(
        testSteps,
        coverageSources,
        idGenerator
      );

      expect(graphView.nodes[0].testSteps[0].input).toEqual("on");
    });

    it("ラジオボタンの操作をした際のGraphViewを生成する", () => {
      const testSteps: TestStepForGraphView[] = [
        {
          ...testStepBase,
          id: "ts1",
          operation: {
            ...testStepBase.operation,
            input: "value1",
            elementInfo: {
              tagname: "INPUT",
              xpath: "xpath1",
              checked: true,
              attributes: { type: "radio", name: "test" },
            },
            inputElements: [
              {
                tagname: "INPUT",
                xpath: "xpath1",
                value: "value1",
                checked: true,
                attributes: { type: "radio", name: "test" },
              },
              {
                tagname: "INPUT",
                xpath: "xpath2",
                value: "value2",
                checked: false,
                attributes: { type: "radio", name: "test" },
              },
            ],
          },
        },
      ];
      const coverageSources: {
        screenDef: string;
        screenElements: (ElementInfo & {
          pageUrl: string;
          pageTitle: string;
        })[];
      }[] = [];
      const idGenerator = createIdGeneratorMock();
      const graphView = generateGraphView(
        testSteps,
        coverageSources,
        idGenerator
      );
      expect(graphView.nodes[0].testSteps[0].input).toEqual("on");
      expect(graphView.store.radioGroup[0]).toEqual({
        name: "test",
        xpath: "xpath1",
      });
    });

    describe("テストステップ群をグループ化してノードを構築する", () => {
      it("screen_transitionがある場合、同テストステップから別ノードとする", () => {
        const testSteps: TestStepForGraphView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: { ...testStepBase.operation, type: "type" },
          },
          // --- ここで分割 ---
          {
            ...testStepBase,
            id: "ts2",
            operation: { ...testStepBase.operation, type: "screen_transition" },
          },
          {
            ...testStepBase,
            id: "ts3",
            operation: { ...testStepBase.operation, type: "type" },
          },
        ];
        const coverageSources = [...coverageSourcesBase];
        const idGenerator = createIdGeneratorMock();

        const graphView = generateGraphView(
          testSteps,
          coverageSources,
          idGenerator
        );

        expect(graphView).toEqual({
          nodes: [
            {
              ...expectedNodeBase,
              testSteps: [{ ...expectedTestStepBase, id: "ts1", type: "type" }],
            },
            {
              ...expectedNodeBase,
              testSteps: [
                {
                  ...expectedTestStepBase,
                  id: "ts2",
                  type: "screen_transition",
                },
                { ...expectedTestStepBase, id: "ts3", type: "type" },
              ],
            },
          ],
          store: { ...expectedStoreBase },
        });
      });

      it("start_capturingがある場合、同テストステップから別ノードとする", () => {
        const testSteps: TestStepForGraphView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: { ...testStepBase.operation, type: "type" },
          },
          // --- ここで分割 ---
          {
            ...testStepBase,
            id: "ts2",
            operation: { ...testStepBase.operation, type: "start_capturing" },
          },
          {
            ...testStepBase,
            id: "ts3",
            operation: { ...testStepBase.operation, type: "type" },
          },
        ];
        const coverageSources = [...coverageSourcesBase];
        const idGenerator = createIdGeneratorMock();

        const graphView = generateGraphView(
          testSteps,
          coverageSources,
          idGenerator
        );

        expect(graphView).toEqual({
          nodes: [
            {
              ...expectedNodeBase,
              testSteps: [{ ...expectedTestStepBase, id: "ts1", type: "type" }],
            },
            {
              ...expectedNodeBase,
              testSteps: [
                {
                  ...expectedTestStepBase,
                  id: "ts2",
                  type: "start_capturing",
                },
                { ...expectedTestStepBase, id: "ts3", type: "type" },
              ],
            },
          ],
          store: { ...expectedStoreBase },
        });
      });

      it("screen_transitionの前のテストステップに画面要素に対する操作がある場合は、その画面要素(トリガー要素)と同一の要素に対して操作した全ての箇所について、次のテストステップから別ノードとする", () => {
        const triggerOperation = {
          ...testStepBase.operation,
          type: "type",
          elementInfo: {
            xpath: "xpath1",
            tagname: "tagname1",
            text: "text1",
            attributes: {},
          },
          url: "url1",
          title: "title1",
        };

        // ts5で画面遷移しているため、直前のts4での操作対象要素をトリガー要素とみなし、全てのトリガー要素の後でノードを区切る
        const testSteps: TestStepForGraphView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: { ...testStepBase.operation, type: "type" },
          },
          {
            ...testStepBase,
            id: "ts2",
            operation: triggerOperation,
          },
          // --- ここで分割 ---
          {
            ...testStepBase,
            id: "ts3",
            operation: { ...testStepBase.operation, type: "type" },
          },
          {
            ...testStepBase,
            id: "ts4",
            operation: triggerOperation,
          },
          // --- ここで分割 ---
          {
            ...testStepBase,
            id: "ts5",
            operation: { ...testStepBase.operation, type: "screen_transition" },
          },
          {
            ...testStepBase,
            id: "ts6",
            operation: triggerOperation,
          },
          // --- ここで分割 ---
          {
            ...testStepBase,
            id: "ts7",
            operation: { ...testStepBase.operation, type: "type" },
          },
        ];
        const coverageSources: {
          screenDef: string;
          screenElements: (ElementInfo & {
            pageUrl: string;
            pageTitle: string;
          })[];
        }[] = [
          {
            screenDef: "画面A",
            screenElements: [
              {
                tagname: "tagname1",
                xpath: "xpath1",
                text: "text1",
                attributes: {},
                pageUrl: "url1",
                pageTitle: "title1",
              },
            ],
          },
        ];
        const idGenerator = {
          ...createIdGeneratorMock(),
          generateElementId: jest.fn().mockReturnValue("triggerElement"),
        };

        const graphView = generateGraphView(
          testSteps,
          coverageSources,
          idGenerator
        );

        expect(graphView).toEqual({
          nodes: [
            {
              ...expectedNodeBase,
              testSteps: [
                { ...expectedTestStepBase, id: "ts1", type: "type" },
                {
                  ...expectedTestStepBase,
                  id: "ts2",
                  type: "type",
                  targetElementId: "triggerElement",
                },
              ],
            },
            {
              ...expectedNodeBase,
              testSteps: [
                { ...expectedTestStepBase, id: "ts3", type: "type" },
                {
                  ...expectedTestStepBase,
                  id: "ts4",
                  type: "type",
                  targetElementId: "triggerElement",
                },
              ],
            },
            {
              ...expectedNodeBase,
              testSteps: [
                {
                  ...expectedTestStepBase,
                  id: "ts5",
                  type: "screen_transition",
                },
                {
                  ...expectedTestStepBase,
                  id: "ts6",
                  type: "type",
                  targetElementId: "triggerElement",
                },
              ],
            },
            {
              ...expectedNodeBase,
              testSteps: [{ ...expectedTestStepBase, id: "ts7", type: "type" }],
            },
          ],
          store: {
            ...expectedStoreBase,
            screens: [
              { id: "s1", name: "画面A", elementIds: ["triggerElement"] },
            ],
            elements: [
              {
                id: "triggerElement",
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath1",
                tagname: "tagname1",
                text: "text1",
                attributes: {},
              },
            ],
          },
        });
      });

      it("screen_transitionもトリガー要素もない場合は全て同一のノードにまとめる", () => {
        const testSteps: TestStepForGraphView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: { ...testStepBase.operation },
          },
          {
            ...testStepBase,
            id: "ts2",
            operation: { ...testStepBase.operation },
          },
          {
            ...testStepBase,
            id: "ts3",
            operation: { ...testStepBase.operation },
          },
        ];
        const coverageSources = [...coverageSourcesBase];
        const idGenerator = createIdGeneratorMock();

        const graphView = generateGraphView(
          testSteps,
          coverageSources,
          idGenerator
        );

        expect(graphView).toEqual({
          nodes: [
            {
              ...expectedNodeBase,
              testSteps: [
                { ...expectedTestStepBase, id: "ts1" },
                { ...expectedTestStepBase, id: "ts2" },
                { ...expectedTestStepBase, id: "ts3" },
              ],
            },
          ],
          store: { ...expectedStoreBase },
        });
      });
    });

    describe("ノード毎に入力要素のデフォルト値を抽出する", () => {
      it("ノード内の最後のテストステップのinputElementsからデフォルト値を抽出する", () => {
        const testSteps: TestStepForGraphView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: {
              ...testStepBase.operation,
              inputElements: [
                {
                  xpath: "xpath1",
                  tagname: "tagname1",
                  text: "text1",
                  attributes: {},
                  value: "value1",
                },
              ],
            },
          },
          {
            ...testStepBase,
            id: "ts2",
            operation: {
              ...testStepBase.operation,
              inputElements: [
                {
                  xpath: "xpath1",
                  tagname: "tagname1",
                  text: "text1",
                  attributes: {},
                  value: "value1",
                },
                {
                  xpath: "xpath2",
                  tagname: "tagname2",
                  text: "text2",
                  attributes: {},
                  value: "value2",
                },
              ],
            },
          },
        ];
        const coverageSources: {
          screenDef: string;
          screenElements: (ElementInfo & {
            pageUrl: string;
            pageTitle: string;
          })[];
        }[] = [
          {
            screenDef: "画面A",
            screenElements: [
              {
                tagname: "tagname1",
                xpath: "xpath1",
                text: "text1",
                attributes: {},
                pageUrl: "url1",
                pageTitle: "title1",
              },
              {
                tagname: "tagname2",
                xpath: "xpath2",
                text: "text2",
                attributes: {},
                pageUrl: "url1",
                pageTitle: "title1",
              },
            ],
          },
        ];
        const idGenerator = {
          ...createIdGeneratorMock(),
          generateElementId: jest
            .fn()
            .mockReturnValueOnce("e1")
            .mockReturnValueOnce("e2"),
        };

        const graphView = generateGraphView(
          testSteps,
          coverageSources,
          idGenerator
        );

        expect(graphView).toEqual({
          nodes: [
            {
              ...expectedNodeBase,
              testSteps: [
                { ...expectedTestStepBase, id: "ts1" },
                { ...expectedTestStepBase, id: "ts2" },
              ],
              defaultValues: [
                { elementId: "e1", value: "value1" },
                { elementId: "e2", value: "value2" },
              ],
            },
          ],
          store: {
            ...expectedStoreBase,
            screens: [{ id: "s1", name: "画面A", elementIds: ["e1", "e2"] }],
            elements: [
              {
                id: "e1",
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath1",
                tagname: "tagname1",
                text: "text1",
                attributes: {},
              },
              {
                id: "e2",
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath2",
                tagname: "tagname2",
                text: "text2",
                attributes: {},
              },
            ],
          },
        });
      });

      it("open_window、switch_windowがテストステップ群にある場合は、それらを除いた中での最後のテストステップのinputElementsからデフォルト値を抽出する", () => {
        const testSteps: TestStepForGraphView[] = [
          {
            ...testStepBase,
            id: "ts1",
            operation: {
              ...testStepBase.operation,
              inputElements: [
                {
                  xpath: "xpath1",
                  tagname: "tagname1",
                  text: "text1",
                  attributes: {},
                  value: "value1",
                },
              ],
            },
          },
          {
            ...testStepBase,
            id: "ts2",
            operation: {
              ...testStepBase.operation,
              inputElements: [
                {
                  xpath: "xpath1",
                  tagname: "tagname1",
                  text: "text1",
                  attributes: {},
                  value: "value1",
                },
                {
                  xpath: "xpath2",
                  tagname: "tagname2",
                  text: "text2",
                  attributes: {},
                  value: "value2",
                },
              ],
            },
          },
          {
            ...testStepBase,
            id: "ts3",
            operation: {
              ...testStepBase.operation,
              type: "open_window",
              inputElements: [],
            },
          },
          {
            ...testStepBase,
            id: "ts4",
            operation: {
              ...testStepBase.operation,
              type: "switch_window",
              inputElements: [],
            },
          },
        ];
        const coverageSources: {
          screenDef: string;
          screenElements: (ElementInfo & {
            pageUrl: string;
            pageTitle: string;
          })[];
        }[] = [
          {
            screenDef: "画面A",
            screenElements: [
              {
                tagname: "tagname1",
                xpath: "xpath1",
                text: "text1",
                attributes: {},
                pageUrl: "url1",
                pageTitle: "title1",
              },
              {
                tagname: "tagname2",
                xpath: "xpath2",
                text: "text2",
                attributes: {},
                pageUrl: "url1",
                pageTitle: "title1",
              },
            ],
          },
        ];
        const idGenerator = {
          ...createIdGeneratorMock(),
          generateElementId: jest
            .fn()
            .mockReturnValueOnce("e1")
            .mockReturnValueOnce("e2"),
        };

        const graphView = generateGraphView(
          testSteps,
          coverageSources,
          idGenerator
        );

        expect(graphView).toEqual({
          nodes: [
            {
              ...expectedNodeBase,
              testSteps: [
                { ...expectedTestStepBase, id: "ts1" },
                { ...expectedTestStepBase, id: "ts2" },
                { ...expectedTestStepBase, id: "ts3", type: "open_window" },
                { ...expectedTestStepBase, id: "ts4", type: "switch_window" },
              ],
              defaultValues: [
                { elementId: "e1", value: "value1" },
                { elementId: "e2", value: "value2" },
              ],
            },
          ],
          store: {
            ...expectedStoreBase,
            screens: [{ id: "s1", name: "画面A", elementIds: ["e1", "e2"] }],
            elements: [
              {
                id: "e1",
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath1",
                tagname: "tagname1",
                text: "text1",
                attributes: {},
              },
              {
                id: "e2",
                pageUrl: "url1",
                pageTitle: "title1",
                xpath: "xpath2",
                tagname: "tagname2",
                text: "text2",
                attributes: {},
              },
            ],
          },
        });
      });
    });
  });
});
