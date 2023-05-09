import {
  ElementMapperFactory,
  IdGenerator,
} from "@/domain/testResultViewGeneration/graphView";

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
