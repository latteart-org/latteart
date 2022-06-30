import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";
import { TestScriptRepository } from "@/lib/eventDispatcher/repositoryService/TestScriptRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("GenerateTestScriptsAction", () => {
  describe("#generate", () => {
    describe("指定の操作履歴を元にテストスクリプトを生成する", () => {
      it.each([
        {
          testScriptOption: { isSimple: false },
          expectedMessageKey:
            "error.operation_history.save_test_scripts_no_section_error",
        },
        {
          testScriptOption: { isSimple: true },
          expectedMessageKey:
            "error.operation_history.save_test_scripts_no_operation_error",
        },
      ])(
        "テストスイートを生成できなかった場合、エラーを返却する",
        async ({ testScriptOption, expectedMessageKey }) => {
          const option = {
            testScript: testScriptOption,
            testData: {
              useDataDriven: false,
              maxGeneration: 0,
            },
          };

          const action = new GenerateTestScriptsAction(
            { testScriptRepository: new TestScriptRepository(baseRestClient) },
            () => "",
            option
          );

          const result = await action.generate({
            testResultId: undefined,
            projectId: undefined,
            sources: [],
          });

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: expectedMessageKey,
            });
          }
        }
      );
    });
  });
});
