import { Operation } from "@/lib/operationHistory/Operation";
import { PageObjectFactory } from "@/lib/operationHistory/scriptGenerator/model/pageObject/PageObjectFactory";
import { PageObjectMethodFactory } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/PageObjectMethodFactory";
import { PageObjectImpl } from "@/lib/operationHistory/scriptGenerator/model/pageObject/PageObject";
import { PageObjectMethod } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/PageObjectMethod";

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

      pageObjectFactory = new PageObjectFactory(methodFactory);
    });

    it("渡されたシーケンスパス群を元にページオブジェクト群を生成する", () => {
      const operation1 = Operation.createOperation({});

      const sequence1 = {
        name: "",
        className: "Page1",
        destination: "",
        operations: [operation1],
        destinationUrl: "",
        url: "url1",
        imageUrl: "path/to/image1",
      };

      const pageObject = pageObjectFactory.createPageObject(
        sequence1.className,
        sequence1.url,
        sequence1.imageUrl,
        [sequence1]
      );

      const expectedPageObject = new PageObjectImpl({
        id: sequence1.className,
        url: sequence1.url,
        imageUrl: sequence1.imageUrl,
        methods: [expectedMethod],
      });

      expect(methodFactory.create).toBeCalledWith(sequence1);

      expect(pageObject).toEqual(expectedPageObject);
    });
  });
});
