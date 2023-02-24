import { PageObjectFactory } from "@/lib/scriptGenerator/model/pageObject/PageObjectFactory";
import { PageObjectMethodFactory } from "@/lib/scriptGenerator/model/pageObject/method/PageObjectMethodFactory";
import { PageObjectImpl } from "@/lib/scriptGenerator/model/pageObject/PageObject";
import { PageObjectMethod } from "@/lib/scriptGenerator/model/pageObject/method/PageObjectMethod";
import { TestScriptSourceOperation } from "@/lib/scriptGenerator/TestScriptSourceOperation";
import { IdentifierGenerator } from "@/lib/scriptGenerator/IdentifierGenerator";

const emptyOperation: TestScriptSourceOperation = {
  screenDef: "",
  type: "",
  elementInfo: null,
  url: "",
  input: "",
  imageFilePath: "",
};

describe("PageObjectFactory", () => {
  describe("#createPageObjects", () => {
    const expectedMethod: PageObjectMethod = {
      id: "",
      pageObjectId: "",
      returnPageObjectId: "",
      operations: [],
      includes: jest.fn(),
    };

    let methodFactory: PageObjectMethodFactory;
    let pageObjectFactory: PageObjectFactory;

    beforeEach(() => {
      methodFactory = {
        create: jest.fn().mockReturnValue(expectedMethod),
      };

      pageObjectFactory = new PageObjectFactory(methodFactory, undefined);
    });

    it("渡されたシーケンスパス群を元にページオブジェクト群を生成する", () => {
      const operation1: TestScriptSourceOperation = { ...emptyOperation };

      const sequence1 = {
        name: "",
        className: "Page1",
        destination: "",
        operations: [operation1],
        destinationUrl: "",
        url: "url1",
        imageUrl: "path/to/image1",
      };

      const generator = new IdentifierGenerator();
      const pageObject = pageObjectFactory.createPageObject(
        sequence1.className,
        sequence1.url,
        sequence1.imageUrl,
        [sequence1]
      );

      const expectedPageObject = new PageObjectImpl(
        {
          id: sequence1.className,
          url: sequence1.url,
          imageUrl: sequence1.imageUrl,
          methods: [expectedMethod],
        },
        {
          methodFilters: [],
        }
      );

      expect(methodFactory.create).toBeCalledWith(sequence1, generator);

      expect(pageObject).toEqual(expectedPageObject);
    });
  });
});
