import {
  PageObjectOperationFactory,
  PageObjectOperationFactoryImpl,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperationFactory";
import { ElementType } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import { PageObjectElementFactory } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectElementFactory";
import { Operation } from "@/lib/operationHistory/Operation";

describe("PageObjectOperationFactoryImpl", () => {
  describe("#createFrom", () => {
    let factory: PageObjectOperationFactory;
    let elementFactory: PageObjectElementFactory;
    let imageUrlResolver: (url: string) => string;

    const target = {
      identifier: "",
      type: ElementType.Other,
      locator: "",
    };

    beforeEach(() => {
      elementFactory = {
        createFrom: jest.fn().mockReturnValue(target),
      };
      imageUrlResolver = jest.fn();

      factory = new PageObjectOperationFactoryImpl(
        imageUrlResolver,
        elementFactory
      );
    });

    it("渡された情報を元にページオブジェクトで使用する操作を生成して返す", () => {
      expect(
        factory.createFrom(
          Operation.createOperation({
            type: "click",
            input: "input",
          }),
          ""
        )
      ).toEqual({
        target,
        type: "click",
        input: "input",
      });

      expect(
        factory.createFrom(
          Operation.createOperation({
            type: "change",
            input: "input",
          }),
          ""
        )
      ).toEqual({
        target,
        type: "change",
        input: "input",
      });

      expect(
        factory.createFrom(
          Operation.createOperation({
            type: "switch_window",
          }),
          "destinationUrl"
        )
      ).toEqual({
        target,
        type: "switch_window",
        input: "destinationUrl",
      });

      expect(
        factory.createFrom(
          Operation.createOperation({
            type: "hogehoge",
            input: "input",
          }),
          ""
        )
      ).toEqual({
        target,
        type: "other",
        input: "input",
      });
    });
  });
});
