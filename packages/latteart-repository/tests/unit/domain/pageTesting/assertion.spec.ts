import { assertPageStateEqual } from "@/domain/pageTesting";

describe("assertPageStateEqual", () => {
  describe("指定のアサーションを用いて画面の各項目について一致判定を行う", () => {
    it("全ての項目が一致する場合は一致した旨を結果として返す", async () => {
      const ss1 = {
        read: async () => {
          return {
            width: 1,
            height: 1,
            data: Buffer.from([0, 0, 0, 255]),
          };
        },
      };
      const ss2 = {
        read: async () => {
          return {
            width: 1,
            height: 1,
            data: Buffer.from([0, 0, 0, 255]),
          };
        },
      };

      const result = await assertPageStateEqual({
        actual: {
          title: "title",
          url: "url",
          elementTexts: [],
          screenshot: ss1,
        },
        expected: {
          title: "title",
          url: "url",
          elementTexts: [],
          screenshot: ss2,
        },
      });

      expect(result).toEqual({
        isOk: true,
        items: {
          title: { isOk: true, actual: "title", expected: "title" },
          url: { isOk: true, actual: "url", expected: "url" },
          elementTexts: { isOk: true, actual: [], expected: [] },
          screenshot: { isOk: true, actual: ss1, expected: ss2 },
        },
      });
    });

    describe("一致しない項目がある場合は一致しなかった旨と差異情報を結果として返す", () => {
      it.each`
        actual     | expected
        ${"title"} | ${"title2"}
        ${""}      | ${"title2"}
        ${"title"} | ${""}
      `(
        "ページタイトルが異なる場合: '$actual' '$expected'",
        async ({ actual, expected }) => {
          const result = await assertPageStateEqual({
            actual: {
              title: actual,
              url: "url",
              elementTexts: [],
            },
            expected: {
              title: expected,
              url: "url",
              elementTexts: [],
            },
          });

          expect(result).toEqual({
            isOk: false,
            items: {
              title: { isOk: false, actual, expected },
              url: { isOk: true, actual: "url", expected: "url" },
              elementTexts: { isOk: true, actual: [], expected: [] },
              screenshot: { isOk: true },
            },
          });
        }
      );

      it.each`
        actual   | expected
        ${"url"} | ${"url2"}
        ${""}    | ${"url2"}
        ${"url"} | ${""}
      `(
        "ページURLが異なる場合: '$actual' '$expected'",
        async ({ actual, expected }) => {
          const result = await assertPageStateEqual({
            actual: {
              title: "title",
              url: actual,
              elementTexts: [],
            },
            expected: {
              title: "title",
              url: expected,
              elementTexts: [],
            },
          });

          expect(result).toEqual({
            isOk: false,
            items: {
              title: { isOk: true, actual: "title", expected: "title" },
              url: { isOk: false, actual, expected },
              elementTexts: { isOk: true, actual: [], expected: [] },
              screenshot: { isOk: true },
            },
          });
        }
      );

      it.each`
        actual                                                   | expected                                                  | description
        ${[{ tagname: "tagname", textWithoutChildren: "hoge" }]} | ${[{ tagname: "tagname", textWithoutChildren: "huga" }]}  | ${"同じ位置の要素の文字列が異なる"}
        ${[{ tagname: "tagname", textWithoutChildren: "hoge" }]} | ${[{ tagname: "tagname2", textWithoutChildren: "hoge" }]} | ${"同じ位置の要素のタグ名が異なる"}
        ${[]}                                                    | ${[{ tagname: "tagname2", textWithoutChildren: "hoge" }]} | ${"実結果側に要素が無い"}
        ${[{ tagname: "tagname", textWithoutChildren: "hoge" }]} | ${[]}                                                     | ${"期待結果側に要素が無い"}
      `("画面要素が異なる場合: $description", async ({ actual, expected }) => {
        const result = await assertPageStateEqual({
          actual: {
            title: "title",
            url: "url",
            elementTexts: actual,
          },
          expected: {
            title: "title",
            url: "url",
            elementTexts: expected,
          },
        });

        expect(result).toEqual({
          isOk: false,
          items: {
            title: { isOk: true, actual: "title", expected: "title" },
            url: { isOk: true, actual: "url", expected: "url" },
            elementTexts: { isOk: false, actual, expected },
            screenshot: { isOk: true },
          },
        });
      });

      describe("スクリーンショットが異なる場合", () => {
        it("色が異なるピクセルがある場合は差分画像を生成する", async () => {
          const ss1 = {
            read: async () => {
              return {
                width: 1,
                height: 1,
                data: Buffer.from([0, 0, 0, 255]),
              };
            },
          };
          const ss2 = {
            read: async () => {
              return {
                width: 1,
                height: 1,
                data: Buffer.from([1, 0, 0, 255]),
              };
            },
          };

          const result = await assertPageStateEqual({
            actual: {
              title: "title",
              url: "url",
              elementTexts: [],
              screenshot: ss1,
            },
            expected: {
              title: "title",
              url: "url",
              elementTexts: [],
              screenshot: ss2,
            },
          });

          expect(result).toEqual({
            isOk: false,
            items: {
              title: { isOk: true, actual: "title", expected: "title" },
              url: { isOk: true, actual: "url", expected: "url" },
              elementTexts: { isOk: true, actual: [], expected: [] },
              screenshot: {
                isOk: false,
                actual: ss1,
                expected: ss2,
                diff: {
                  width: 1,
                  height: 1,
                  data: Buffer.from([255, 0, 0, 255]),
                },
              },
            },
          });
        });
      });
    });
  });
});
