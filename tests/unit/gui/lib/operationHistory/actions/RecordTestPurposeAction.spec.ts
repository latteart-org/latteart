import { RecordTestPurposeAction } from "@/lib/operationHistory/actions/testPurpose/RecordTestPurposeAction";
import { Note } from "@/lib/operationHistory/Note";
import { TestStepRepositoryImpl } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { NoteRepositoryImpl } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import {
  RESTClientResponse,
  RESTClient,
} from "@/lib/eventDispatcher/RESTClient";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("RecordTestPurposeAction", () => {
  describe("#add", () => {
    describe("渡されたテスト目的をリポジトリに追加する", () => {
      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      it("記録に成功した場合は記録されたテスト目的を返す", async () => {
        const expectedNote = {
          id: "intention1",
          type: "intention",
          value: "summary",
          details: "details",
        };
        const postResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedNote,
        };
        const expectedTestStep = {
          id: "1",
          operation: {},
          intention: "intention1",
          bugs: null,
          notices: null,
        };
        const patchResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedTestStep,
        };
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(postResSuccess),
          httpPatch: jest.fn().mockResolvedValue(patchResSuccess),
        };
        const action = new RecordTestPurposeAction({
          testStepRepository: new TestStepRepositoryImpl(restClient),
          noteRepository: new NoteRepositoryImpl(restClient),
          serviceUrl: "serviceUrl",
        });

        const testResultId = "testResultId";
        const testStepId = "testStepId";
        const note = {
          summary: "summary",
          details: "details",
        };
        const result = await action.add(testResultId, testStepId, note);

        expect(restClient.httpPost).toBeCalledWith(
          `/test-results/${testResultId}/notes`,
          {
            type: "intention",
            value: note.summary,
            details: note.details,
          }
        );
        expect(restClient.httpPatch).toBeCalledWith(
          `/test-results/${testResultId}/test-steps/${testStepId}`,
          { intention: expectedNote.id }
        );

        if (result.isFailure()) {
          throw new Error("failed");
        }

        expect(result.data).toEqual(
          new Note({
            value: "summary",
            details: "details",
            sequence: 0,
          })
        );
      });

      describe("テスト目的の記録に失敗した場合は、エラー情報を返す", () => {
        it("テストステップへの紐づけに失敗した場合", async () => {
          const expectedNote = {
            id: "intention1",
            type: "intention",
            value: "summary",
            details: "details",
          };
          const resSuccess: RESTClientResponse = {
            status: 200,
            data: expectedNote,
          };
          const restClient = {
            ...baseRestClient,
            httpPost: jest.fn().mockResolvedValue(resSuccess),
            httpPatch: jest.fn().mockResolvedValue(resFailure),
          };
          const action = new RecordTestPurposeAction({
            testStepRepository: new TestStepRepositoryImpl(restClient),
            noteRepository: new NoteRepositoryImpl(restClient),
            serviceUrl: "serviceUrl",
          });

          const testResultId = "testResultId";
          const testStepId = "testStepId";
          const note = {
            summary: "summary",
            details: "details",
          };
          const result = await action.add(testResultId, testStepId, note);

          expect(restClient.httpPost).toBeCalledWith(
            `/test-results/${testResultId}/notes`,
            {
              type: "intention",
              value: note.summary,
              details: note.details,
            }
          );
          expect(restClient.httpPatch).toBeCalledWith(
            `/test-results/${testResultId}/test-steps/${testStepId}`,
            { intention: expectedNote.id }
          );

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: "error.operation_history.record_test_purpose_failed",
            });
          }
        });
      });
    });
  });

  describe("#edit", () => {
    describe("既存のテスト目的の内容を渡されたテスト目的で上書きする", () => {
      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      it("記録に成功した場合は記録されたテスト目的を返す", async () => {
        const expectedTestStep = {
          id: "intention1",
          operation: {},
          intention: "intention1",
          bugs: null,
          notices: null,
        };
        const getResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedTestStep,
        };
        const expectedNote = {
          id: "",
          type: "intention",
          value: "summary",
          details: "details",
        };
        const putResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedNote,
        };
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(getResSuccess),
          httpPut: jest.fn().mockResolvedValue(putResSuccess),
        };
        const action = new RecordTestPurposeAction({
          testStepRepository: new TestStepRepositoryImpl(restClient),
          noteRepository: new NoteRepositoryImpl(restClient),
          serviceUrl: "serviceUrl",
        });

        const testResultId = "testResultId";
        const testStepId = "testStepId";
        const note = {
          summary: "summary",
          details: "details",
        };
        const result = await action.edit(testResultId, testStepId, note);

        expect(restClient.httpGet).toBeCalledWith(
          `/test-results/${testResultId}/test-steps/${testStepId}`
        );
        expect(restClient.httpPut).toBeCalledWith(
          `/test-results/${testResultId}/notes/${expectedTestStep.intention}`,
          {
            type: "intention",
            value: note.summary,
            details: note.details,
          }
        );

        if (result.isFailure()) {
          throw new Error("failed");
        }

        expect(result.data).toEqual(
          new Note({
            value: "summary",
            details: "details",
            sequence: 0,
          })
        );
      });

      describe("テスト目的の記録に失敗した場合は、エラー情報を返す", () => {
        it("テスト目的の内容の更新に失敗した場合", async () => {
          const expectedTestStep = {
            id: "intention1",
            operation: {},
            intention: "intention1",
            bugs: null,
            notices: null,
          };
          const resSuccess: RESTClientResponse = {
            status: 200,
            data: expectedTestStep,
          };
          const restClient = {
            ...baseRestClient,
            httpGet: jest.fn().mockResolvedValue(resSuccess),
            httpPut: jest.fn().mockResolvedValue(resFailure),
          };
          const action = new RecordTestPurposeAction({
            testStepRepository: new TestStepRepositoryImpl(restClient),
            noteRepository: new NoteRepositoryImpl(restClient),
            serviceUrl: "serviceUrl",
          });

          const testResultId = "testResultId";
          const testStepId = "testStepId";
          const note = {
            summary: "summary",
            details: "details",
          };
          const result = await action.edit(testResultId, testStepId, note);

          expect(restClient.httpGet).toBeCalledWith(
            `/test-results/${testResultId}/test-steps/${testStepId}`
          );
          expect(restClient.httpPut).toBeCalledWith(
            `/test-results/${testResultId}/notes/${expectedTestStep.intention}`,
            {
              type: "intention",
              value: note.summary,
              details: note.details,
            }
          );

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: "error.operation_history.record_test_purpose_failed",
            });
          }
        });
      });
    });
  });
});
