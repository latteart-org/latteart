import {
  RecordIntentionAction,
  RecordIntentionActionObserver,
} from "@/lib/operationHistory/actions/intention/RecordIntentionAction";
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

describe("RecordIntentionAction", () => {
  describe("#record", () => {
    describe("渡されたテスト目的をリポジトリに記録する", () => {
      let observer: RecordIntentionActionObserver;
      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      beforeEach(() => {
        observer = {
          setIntention: jest.fn(),
          getTestStepId: jest.fn().mockImplementation((sequence) => {
            return `id_of_${sequence}`;
          }),
        };
      });

      describe("記録に成功した場合は結果をオブザーバに渡す", () => {
        it("記録対象と同じシーケンス番号を持つテスト目的が渡されたテスト履歴内にない場合はテスト目的を追加する", async () => {
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
          const action = new RecordIntentionAction(observer, {
            testStepRepository: new TestStepRepositoryImpl(restClient),
            noteRepository: new NoteRepositoryImpl(restClient),
            serviceUrl: "serviceUrl",
          });

          const history = [{ intention: null }, { intention: { sequence: 0 } }];
          const note = {
            testResultId: "testResultId",
            sequence: 1,
            summary: "summary",
            details: "details",
          };
          const result = await action.record(history, note);

          expect(restClient.httpPost).toBeCalledWith(
            `/test-results/${note.testResultId}/notes`,
            {
              type: "intention",
              value: note.summary,
              details: note.details,
            }
          );
          expect(restClient.httpPatch).toBeCalledWith(
            `/test-results/${
              note.testResultId
            }/test-steps/${observer.getTestStepId(note.sequence)}`,
            { intention: expectedNote.id }
          );
          expect(observer.setIntention).toBeCalledWith(
            new Note({
              value: "summary",
              details: "details",
              sequence: note.sequence,
            })
          );

          if (result.isFailure()) {
            throw new Error("failed");
          }
        });

        it("記録対象と同じシーケンス番号を持つテスト目的が渡されたテスト履歴内に既にある場合はテスト目的を更新する", async () => {
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
          const action = new RecordIntentionAction(observer, {
            testStepRepository: new TestStepRepositoryImpl(restClient),
            noteRepository: new NoteRepositoryImpl(restClient),
            serviceUrl: "serviceUrl",
          });

          const history = [
            { intention: { sequence: 0 } },
            { intention: { sequence: 1 } },
          ];
          const note = {
            testResultId: "testResultId",
            sequence: 1,
            summary: "summary",
            details: "details",
          };
          const result = await action.record(history, note);

          expect(restClient.httpGet).toBeCalledWith(
            `/test-results/${
              note.testResultId
            }/test-steps/${observer.getTestStepId(note.sequence)}`
          );
          expect(restClient.httpPut).toBeCalledWith(
            `/test-results/${note.testResultId}/notes/${expectedTestStep.intention}`,
            {
              type: "intention",
              value: note.summary,
              details: note.details,
            }
          );
          expect(observer.setIntention).toBeCalledWith(
            new Note({
              value: "summary",
              details: "details",
              sequence: note.sequence,
            })
          );

          if (result.isFailure()) {
            throw new Error("failed");
          }
        });
      });

      describe("テスト目的の記録に失敗した場合は、エラー情報を返す", () => {
        it("テスト目的を持たないテストステップに対して、テスト目的を追加する場合", async () => {
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
          const action = new RecordIntentionAction(observer, {
            testStepRepository: new TestStepRepositoryImpl(restClient),
            noteRepository: new NoteRepositoryImpl(restClient),
            serviceUrl: "serviceUrl",
          });

          const history = [{ intention: null }, { intention: { sequence: 0 } }];
          const note = {
            testResultId: "testResultId",
            sequence: 1,
            summary: "summary",
            details: "details",
          };
          const result = await action.record(history, note);

          expect(restClient.httpPost).toBeCalledWith(
            `/test-results/${note.testResultId}/notes`,
            {
              type: "intention",
              value: note.summary,
              details: note.details,
            }
          );
          expect(restClient.httpPatch).toBeCalledWith(
            `/test-results/${
              note.testResultId
            }/test-steps/${observer.getTestStepId(note.sequence)}`,
            { intention: expectedNote.id }
          );
          expect(observer.setIntention).not.toBeCalled();

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: "error.operation_history.record_test_purpose_failed",
            });
          }
        });

        it("テスト目的を既に持つテストステップに対して、テスト目的を更新する場合", async () => {
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
          const action = new RecordIntentionAction(observer, {
            testStepRepository: new TestStepRepositoryImpl(restClient),
            noteRepository: new NoteRepositoryImpl(restClient),
            serviceUrl: "serviceUrl",
          });

          const history = [
            { intention: { sequence: 0 } },
            { intention: { sequence: 1 } },
          ];
          const note = {
            testResultId: "testResultId",
            sequence: 1,
            summary: "summary",
            details: "details",
          };
          const result = await action.record(history, note);

          expect(restClient.httpGet).toBeCalledWith(
            `/test-results/${
              note.testResultId
            }/test-steps/${observer.getTestStepId(note.sequence)}`
          );
          expect(restClient.httpPut).toBeCalledWith(
            `/test-results/${note.testResultId}/notes/${expectedTestStep.intention}`,
            {
              type: "intention",
              value: note.summary,
              details: note.details,
            }
          );
          expect(observer.setIntention).not.toBeCalled();

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
