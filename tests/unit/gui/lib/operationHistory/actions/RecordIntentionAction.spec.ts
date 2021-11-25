import {
  RecordIntentionAction,
  RecordIntentionActionObserver,
  IntentionRecordable,
} from "@/lib/operationHistory/actions/RecordIntentionAction";
import { Note } from "@/lib/operationHistory/Note";
import { Reply } from "@/lib/captureControl/Reply";

describe("RecordIntentionAction", () => {
  describe("#record", () => {
    describe("渡されたテスト目的をリポジトリに記録する", () => {
      let observer: RecordIntentionActionObserver;
      let reply: Reply<Note>;
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
        };
      });

      describe("記録に成功した場合は結果をオブザーバに渡す", () => {
        beforeEach(() => {
          reply = {
            succeeded: true,
            data: new Note({}),
          };

          dispatcher = {
            editIntention: jest.fn().mockResolvedValue(reply),
            addIntention: jest.fn().mockResolvedValue(reply),
          };
        });

        afterEach(() => {
          expect(observer.setIntention).toBeCalledWith(reply.data);
        });

        it("記録対象と同じシーケンス番号を持つテスト目的が渡されたテスト履歴内にない場合はテスト目的を追加する", async () => {
          const history = [{ intention: null }, { intention: { sequence: 0 } }];

          await new RecordIntentionAction(observer, dispatcher).record(
            history,
            note
          );

          expect(dispatcher.addIntention).toBeCalledWith(
            note.testResultId,
            note.sequence,
            { summary: note.summary, details: note.details }
          );

          expect(dispatcher.editIntention).not.toBeCalled();
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

          expect(dispatcher.editIntention).toBeCalledWith(
            note.testResultId,
            note.sequence,
            { summary: note.summary, details: note.details }
          );

          expect(dispatcher.addIntention).not.toBeCalled();
        });
      });

      describe("記録に失敗した場合は結果をオブザーバに渡さない", () => {
        beforeEach(() => {
          reply = {
            succeeded: false,
            error: {
              code: "errorCode",
              message: "errorMessage",
            },
          };

          dispatcher = {
            editIntention: jest.fn().mockResolvedValue(reply),
            addIntention: jest.fn().mockResolvedValue(reply),
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

          expect(dispatcher.addIntention).toBeCalled();
          expect(dispatcher.editIntention).not.toBeCalled();
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

          expect(dispatcher.editIntention).toBeCalled();
          expect(dispatcher.addIntention).not.toBeCalled();
        });
      });
    });
  });
});
