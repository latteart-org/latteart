import { ScreenDefinitionSetting } from "@/lib/common/settings/Settings";
import ScreenDefFactory from "@/lib/operationHistory/ScreenDefFactory";

describe("ScreenDefFactoryは", () => {
  describe("createFromが呼ばれると、指定されたURL、タイトルと画面定義設定を元にscreenDefを生成して返す", () => {
    const createConditions = (
      isEnabled: boolean,
      definitionType: "url" | "title" | "keyword",
      matchType: "contains" | "equals" | "regex",
      word: string
    ) => {
      return {
        isEnabled,
        definitionType,
        matchType,
        word,
      };
    };
    it("画面定義タイプ: title", () => {
      const screenDefinitionConfig: ScreenDefinitionSetting = {
        screenDefType: "title",
        conditionGroups: [
          {
            isEnabled: true,
            screenName: "url_contains",
            conditions: [createConditions(true, "url", "contains", "aaa")],
          },
          {
            isEnabled: true,
            screenName: "url_equals",
            conditions: [
              createConditions(
                true,
                "url",
                "equals",
                "http://localhost/aa/100"
              ),
            ],
          },
          {
            isEnabled: true,
            screenName: "url_regex",
            conditions: [createConditions(true, "url", "regex", "https.*")],
          },

          {
            isEnabled: true,
            screenName: "title_contains",
            conditions: [createConditions(true, "title", "contains", "bbb")],
          },
          {
            isEnabled: true,
            screenName: "title_equals",
            conditions: [createConditions(true, "title", "equals", "bb")],
          },
          {
            isEnabled: true,
            screenName: "title_regex",
            conditions: [createConditions(true, "title", "regex", "z+")],
          },

          {
            isEnabled: true,
            screenName: "keyword_contains",
            conditions: [createConditions(true, "keyword", "contains", "ccc")],
          },
          {
            isEnabled: true,
            screenName: "keyword_equals",
            conditions: [createConditions(true, "keyword", "equals", "ccd")],
          },
          {
            isEnabled: true,
            screenName: "keyword_regex",
            conditions: [createConditions(true, "keyword", "regex", "zx.")],
          },
        ],
      };
      const factory = new ScreenDefFactory(screenDefinitionConfig);

      expect(
        factory.createFrom(
          "aaa",
          "http://localhost/aaa/100",
          new Set(["123", "aaa"])
        )
      ).toEqual("url_contains");
      expect(
        factory.createFrom(
          "aaa",
          "http://localhost/aa/100",
          new Set(["123", "aaa"])
        )
      ).toEqual("url_equals");
      expect(
        factory.createFrom(
          "bbbb",
          "https://localhost/b/10",
          new Set(["123", "aaa"])
        )
      ).toEqual("url_regex");

      expect(
        factory.createFrom(
          "bbbb",
          "http://localhost/b/10",
          new Set(["123", "aaa"])
        )
      ).toEqual("title_contains");

      expect(
        factory.createFrom(
          "bb",
          "http://localhost/b/10",
          new Set(["123", "aaa"])
        )
      ).toEqual("title_equals");

      expect(
        factory.createFrom(
          "zzz",
          "http://localhost/b/10",
          new Set(["123", "aaa"])
        )
      ).toEqual("title_regex");

      expect(
        factory.createFrom(
          "ddd",
          "http://localhost/c/10",
          new Set(["123", "cccc"])
        )
      ).toEqual("keyword_contains");

      expect(
        factory.createFrom(
          "cccc",
          "http://localhost/b/10",
          new Set(["123", "ccd"])
        )
      ).toEqual("keyword_equals");

      expect(
        factory.createFrom(
          "eeee",
          "http://localhost/b/10",
          new Set(["123", "zxy"])
        )
      ).toEqual("keyword_regex");

      expect(
        factory.createFrom(
          "title1",
          "http://localhost/uoyp/ght",
          new Set(["123", "gkhlto"])
        )
      ).toEqual("title1");
    });

    it("画面定義タイプ: url", () => {
      const screenDefinitionConfig: ScreenDefinitionSetting = {
        screenDefType: "url",
        conditionGroups: [
          {
            isEnabled: true,
            screenName: "screen1",
            conditions: [
              createConditions(true, "url", "contains", "aaa"),
              createConditions(true, "title", "regex", "[0-9]{3}"),
            ],
          },
        ],
      };
      const factory = new ScreenDefFactory(screenDefinitionConfig);

      expect(
        factory.createFrom(
          "aaa",
          "http://localhost/aaa/100",
          new Set(["123", "aaa"])
        )
      ).toEqual("http://localhost/aaa/100");
      expect(
        factory.createFrom(
          "e113aa",
          "http://localhost/bbb/100",
          new Set(["123", "aaa"])
        )
      ).toEqual("http://localhost/bbb/100");
      expect(
        factory.createFrom(
          "a125fe",
          "http://localhost/aaa/100",
          new Set(["123", "aaa"])
        )
      ).toEqual("screen1");
    });

    describe("優先条件が複数(2条件)", () => {
      it("両方有効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: true,
              screenName: "screen1",
              conditions: [createConditions(true, "title", "contains", "aaa")],
            },
            {
              isEnabled: true,
              screenName: "screen2",
              conditions: [createConditions(true, "title", "contains", "bbb")],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("screen1");
      });

      it("一つ目が有効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: true,
              screenName: "screen1",
              conditions: [createConditions(true, "title", "contains", "aaa")],
            },
            {
              isEnabled: false,
              screenName: "screen2",
              conditions: [createConditions(true, "title", "contains", "bbb")],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("screen1");
      });

      it("二つ目が有効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: false,
              screenName: "screen1",
              conditions: [createConditions(true, "title", "contains", "aaa")],
            },
            {
              isEnabled: true,
              screenName: "screen2",
              conditions: [createConditions(true, "title", "contains", "bbb")],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("screen2");
      });

      it("両方無効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: false,
              screenName: "screen1",
              conditions: [createConditions(true, "title", "contains", "aaa")],
            },
            {
              isEnabled: false,
              screenName: "screen2",
              conditions: [createConditions(true, "title", "contains", "bbb")],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("aaabbb");
      });
    });

    describe("詳細条件が複数(2条件)", () => {
      it("両方有効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: true,
              screenName: "screen1",
              conditions: [
                createConditions(true, "title", "contains", "aaa"),
                createConditions(true, "title", "contains", "bbb"),
              ],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("screen1");
      });

      it("一つ目が有効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: true,
              screenName: "screen1",
              conditions: [
                createConditions(true, "title", "contains", "aaa"),
                createConditions(false, "title", "contains", "bbb"),
              ],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("screen1");
      });

      it("二つ目が有効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: true,
              screenName: "screen1",
              conditions: [
                createConditions(false, "title", "contains", "aaa"),
                createConditions(true, "title", "contains", "bbb"),
              ],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("screen1");
      });

      it("両方無効", () => {
        const screenDefinitionConfig: ScreenDefinitionSetting = {
          screenDefType: "title",
          conditionGroups: [
            {
              isEnabled: true,
              screenName: "screen1",
              conditions: [
                createConditions(false, "title", "contains", "aaa"),
                createConditions(false, "title", "contains", "bbb"),
              ],
            },
          ],
        };
        const factory = new ScreenDefFactory(screenDefinitionConfig);
        expect(
          factory.createFrom(
            "aaabbb",
            "http://localhost/aaa/100",
            new Set(["123", "aaa"])
          )
        ).toEqual("aaabbb");
      });
    });
  });
});
