import {
  SaveIntentionAction,
  IntentionInfo,
  SaveIntentionActionObserver,
} from "@/lib/operationHistory/actions/SaveIntentionAction";

describe("SaveIntentionAction", () => {
  describe("#save", () => {
    let observer: SaveIntentionActionObserver;

    const testResultId = "testResult1";

    beforeEach(() => {
      observer = {
        recordIntention: jest.fn(),
        moveIntention: jest.fn(),
      };
    });

    describe("指定された情報を元に対象シーケンス番号を決め、テスト目的を記録する", () => {
      it("oldSequenceが指定されている場合はそれを対象シーケンス番号として使用する", async () => {
        const noteEditInfo: IntentionInfo = {
          note: "summary",
          noteDetails: "details",
          oldSequence: 0,
          newSequence: 0,
        };

        await new SaveIntentionAction(observer).save(
          testResultId,
          noteEditInfo,
          []
        );

        expect(observer.recordIntention).toBeCalledWith({
          testResultId,
          summary: noteEditInfo.note,
          details: noteEditInfo.noteDetails,
          sequence: noteEditInfo.oldSequence,
        });
      });

      it("oldSequenceが指定されていない場合は履歴の最新の操作+1のシーケンス番号を使用する", async () => {
        const noteEditInfo: IntentionInfo = {
          note: "summary",
          noteDetails: "details",
          newSequence: 0,
        };

        const history = [
          {
            operation: {
              sequence: 0,
            },
          },
        ];

        await new SaveIntentionAction(observer).save(
          testResultId,
          noteEditInfo,
          history
        );

        expect(observer.recordIntention).toBeCalledWith({
          testResultId,
          summary: noteEditInfo.note,
          details: noteEditInfo.noteDetails,
          sequence: history[history.length - 1].operation.sequence + 1,
        });
      });

      it("oldSequenceが指定されておらず、履歴も空の場合は対象シーケンス番号に1を使用する", async () => {
        const noteEditInfo: IntentionInfo = {
          note: "summary",
          noteDetails: "details",
          newSequence: 0,
        };

        await new SaveIntentionAction(observer).save(
          testResultId,
          noteEditInfo,
          []
        );

        expect(observer.recordIntention).toBeCalledWith({
          testResultId,
          summary: noteEditInfo.note,
          details: noteEditInfo.noteDetails,
          sequence: 1,
        });
      });
    });

    describe("テスト目的の記録の後にテスト目的を移動する", () => {
      afterEach(() => {
        expect(observer.recordIntention).toBeCalled();
      });

      it("oldSequence、newSequenceが両方指定されている場合はテスト目的を移動する", async () => {
        const noteEditInfo: IntentionInfo = {
          note: "summary",
          noteDetails: "details",
          oldSequence: 0,
          newSequence: 0,
        };

        await new SaveIntentionAction(observer).save(
          testResultId,
          noteEditInfo,
          []
        );

        expect(observer.moveIntention).toHaveBeenLastCalledWith(
          noteEditInfo.oldSequence,
          noteEditInfo.newSequence
        );
      });

      it("oldSequence、newSequenceのいずれかが指定されていない場合はテスト目的を移動しない", async () => {
        const action = new SaveIntentionAction(observer);

        await action.save(
          testResultId,
          {
            note: "summary",
            noteDetails: "details",
            newSequence: 0,
          },
          []
        );

        await action.save(
          testResultId,
          {
            note: "summary",
            noteDetails: "details",
            oldSequence: 0,
          },
          []
        );

        expect(observer.moveIntention).not.toBeCalled();
      });
    });
  });
});
