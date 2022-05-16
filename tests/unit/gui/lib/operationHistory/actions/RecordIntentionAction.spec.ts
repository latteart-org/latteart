import {
  RecordIntentionAction,
  RecordIntentionActionObserver,
  IntentionRecordable,
} from "@/lib/operationHistory/actions/RecordIntentionAction";
import { Note } from "@/lib/operationHistory/Note";
import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";

describe("RecordIntentionAction", () => {
  describe("#record", () => {
    describe("渡されたテスト目的をリポジトリに記録する", () => {
      let observer: RecordIntentionActionObserver;
      let testStepRepository: TestStepRepository;
      let noteRepository: NoteRepository;
      let dispatcher: IntentionRecordable;

      const note = {
        testResultId: "testResultId",
        sequence: 1,
        summary: "summary",
        details: "details",
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
        beforeEach(() => {
          const reply = {
            status: 200,
            data: new Note({}),
          };

          const testStepReply = {
            status: 200,
            data: {
              id: "1",
              operation: {},
              intention: "intention1",
              bugs: null,
              notices: null,
            },
          };

          testStepRepository = {
            getTestSteps: jest.fn().mockResolvedValue(testStepReply),
            patchTestSteps: jest.fn().mockResolvedValue(reply),
            postTestSteps: jest.fn(),
          };

          noteRepository = {
            getNotes: jest.fn(),
            postNotes: jest.fn().mockResolvedValue(reply),
            putNotes: jest.fn().mockResolvedValue(reply),
            deleteNotes: jest.fn(),
          };

          dispatcher = {
            testStepRepository,
            noteRepository,
            serviceUrl: "serviceUrl",
          };
        });

        it("記録対象と同じシーケンス番号を持つテスト目的が渡されたテスト履歴内にない場合はテスト目的を追加する", async () => {
          const history = [{ intention: null }, { intention: { sequence: 0 } }];

          await new RecordIntentionAction(observer, dispatcher).record(
            history,
            note
          );

          expect(dispatcher.noteRepository.postNotes).toBeCalledWith(
            note.testResultId,
            {
              summary: note.summary,
              details: note.details,
            }
          );

          expect(dispatcher.testStepRepository.getTestSteps).not.toBeCalled();
        });

        it("記録対象と同じシーケンス番号を持つテスト目的が渡されたテスト履歴内に既にある場合はテスト目的を更新する", async () => {
          const history = [
            { intention: { sequence: 0 } },
            { intention: { sequence: 1 } },
          ];

          await new RecordIntentionAction(observer, dispatcher).record(
            history,
            note
          );

          expect(dispatcher.testStepRepository.getTestSteps).toBeCalledWith(
            note.testResultId,
            `id_of_${note.sequence}`
          );

          expect(dispatcher.noteRepository.postNotes).not.toBeCalled();
        });
      });

      describe("記録に失敗した場合は結果をオブザーバに渡さない", () => {
        beforeEach(() => {
          const reply = {
            status: 500,
            error: {
              code: "errorCode",
              message: "errorMessage",
            },
          };

          const testStepReply = {
            status: 200,
            data: {
              id: "1",
              operation: {},
              intention: "intention1",
              bugs: null,
              notices: null,
            },
          };

          testStepRepository = {
            getTestSteps: jest.fn().mockResolvedValue(testStepReply),
            patchTestSteps: jest.fn().mockResolvedValue(reply),
            postTestSteps: jest.fn(),
          };

          noteRepository = {
            getNotes: jest.fn(),
            postNotes: jest.fn().mockResolvedValue(reply),
            putNotes: jest.fn().mockResolvedValue(reply),
            deleteNotes: jest.fn(),
          };

          dispatcher = {
            testStepRepository,
            noteRepository,
            serviceUrl: "serviceUrl",
          };
        });

        afterEach(() => {
          expect(observer.setIntention).not.toBeCalled();
        });

        it("テスト目的の追加の場合", async () => {
          const history = [{ intention: null }, { intention: { sequence: 0 } }];

          await new RecordIntentionAction(observer, dispatcher).record(
            history,
            note
          );

          expect(dispatcher.noteRepository.postNotes).toBeCalled();
          expect(dispatcher.testStepRepository.getTestSteps).not.toBeCalled();
        });

        it("テスト目的の更新の場合", async () => {
          const history = [
            { intention: { sequence: 0 } },
            { intention: { sequence: 1 } },
          ];

          await new RecordIntentionAction(observer, dispatcher).record(
            history,
            note
          );

          expect(dispatcher.testStepRepository.getTestSteps).toBeCalled();
          expect(dispatcher.noteRepository.postNotes).not.toBeCalled();
        });
      });
    });
  });
});
