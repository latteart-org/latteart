import { PageObjectImpl } from "@/lib/operationHistory/scriptGenerator/model/pageObject/PageObject";
import {
  ElementType,
  OperationType,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import { PageObjectMethod } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/PageObjectMethod";

describe("PageObjectImpl", () => {
  describe("#collectMethodInputVariations", () => {
    describe("ページオブジェクト内のメソッドのうち、包含関係にあるものは手前に登場したものの別入力値バリエーションとしてまとめて返す", () => {
      const element1 = {
        identifier: "element1",
        type: ElementType.Other,
        locator: "",
      };

      const element2 = {
        identifier: "element2",
        type: ElementType.Other,
        locator: "",
      };

      let method1: PageObjectMethod;
      let method2: PageObjectMethod;

      beforeEach(() => {
        method1 = {
          id: "id1",
          pageObjectId: "",
          operations: [],
          returnPageObjectId: "",
          includes: jest.fn(() => {
            // 相手が何でも包含しているとみなす
            return true;
          }),
        };

        method2 = {
          id: "id2",
          pageObjectId: "",
          operations: [],
          returnPageObjectId: "",
          includes: jest.fn((other) => {
            // 相手が自身の場合のみ包含しているとみなす
            return other === method2;
          }),
        };
      });

      it("初回に入力した要素を2回目以降で入力していない場合、その要素の値は空文字としてバリエーションに追加する", () => {
        method1.operations.push(
          {
            target: element1,
            type: OperationType.Change,
            input: "aaa",
          },
          {
            target: element2,
            type: OperationType.Change,
            input: "bbb",
          }
        );

        method2.operations.push({
          target: element1,
          type: OperationType.Change,
          input: "aaa2",
        });

        const pageObject = new PageObjectImpl({
          id: "",
          url: "",
          methods: [method1, method2],
        });

        const result = pageObject.collectMethodInputVariations();

        expect([...result.entries()]).toEqual([
          [
            method1.id,
            [
              { element1: "aaa", element2: "bbb" },
              { element1: "aaa2", element2: "" },
            ],
          ],
        ]);
      });

      it("既存のバリエーションと完全に入力値が同じ場合はバリエーションに追加しない", () => {
        const operations1 = [
          {
            target: element1,
            type: OperationType.Change,
            input: "aaa",
          },
          {
            target: element2,
            type: OperationType.Change,
            input: "bbb",
          },
        ];

        // 操作の順番は問わない
        const operations2 = [
          {
            target: element2,
            type: OperationType.Change,
            input: "bbb",
          },
          {
            target: element1,
            type: OperationType.Change,
            input: "aaa",
          },
        ];

        method1.operations.push(...operations1);
        method2.operations.push(...operations2);

        const pageObject = new PageObjectImpl({
          id: "",
          url: "",
          methods: [method1, method2],
        });

        const result = pageObject.collectMethodInputVariations();

        expect([...result.entries()]).toEqual([
          [method1.id, [{ element1: "aaa", element2: "bbb" }]],
        ]);
      });
    });
  });
});
