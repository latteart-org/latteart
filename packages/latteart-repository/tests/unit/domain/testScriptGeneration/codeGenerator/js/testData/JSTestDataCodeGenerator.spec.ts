import { JSTestDataCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/testData/JSTestDataCodeGenerator";
import { TestDataSet } from "@/domain/testScriptGeneration/testDataRepository";

describe("JSTestDataCodeGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたテストデータからJavaScriptのコードを生成する", () => {
      const testDataSet1: TestDataSet = {
        name: "testDataSet1",
        variations: [
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObject1",
                methodId: "method1",
                methodArguments: [
                  { name: "param1", value: "value1" },
                  { name: "param2", value: "value2" },
                ],
              },
              {
                pageObjectId: "pageObject1",
                methodId: "method2",
                methodArguments: [
                  { name: "param3", value: "value3" },
                  { name: "param4", value: "value4" },
                ],
              },
              {
                pageObjectId: "pageObject1",
                methodId: "method3",
                methodArguments: [],
              },
            ],
          },
        ],
      };

      const testDataSet2: TestDataSet = {
        name: "testDataSet2",
        variations: [
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObject1",
                methodId: "method4",
                methodArguments: [
                  { name: "param5", value: "value5" },
                  { name: "param6", value: "value6" },
                ],
              },
            ],
          },
        ],
      };

      const testDataSet3: TestDataSet = {
        name: "testDataSet3",
        variations: [],
      };

      const testDataSets = [testDataSet1, testDataSet2, testDataSet3];

      const nameGenerator = {
        pageObject: {
          generate: jest.fn().mockImplementation((id) => {
            return `name_of_${id}`;
          }),
        },
        method: {
          generate: jest.fn().mockImplementation((id) => {
            return `name_of_${id}`;
          }),
        },
      };

      const generator = new JSTestDataCodeGenerator(nameGenerator);

      expect(generator.generateFrom(...testDataSets)).toEqual(`\
export const testDataSet1 = [
  {
    name_of_pageObject1_name_of_method1: {
      param1: 'value1',
      param2: 'value2'
    },
    name_of_pageObject1_name_of_method2: {
      param3: 'value3',
      param4: 'value4'
    }
  }
];

export const testDataSet2 = [
  {
    name_of_pageObject1_name_of_method4: {
      param5: 'value5',
      param6: 'value6'
    }
  }
];

export const testDataSet3 = [
  {}
];
`);
    });
  });
});
