import {
  MoveIntentionAction,
  IntentionMovable,
  MoveIntentionActionObserver,
} from "@/lib/operationHistory/actions/MoveIntentionAction";
import { Note } from "@/lib/operationHistory/Note";
import { Reply } from "@/lib/captureControl/Reply";

describe("MoveIntentionAction", () => {
  describe("#move", () => {
    let observer: MoveIntentionActionObserver;
    let reply: Reply<Note>;
    let dispatcher: IntentionMovable;

    const testResultId = "testResultId";
    const fromSequence = 0;
    const destSequence = 0;

    beforeEach(() => {
      observer = {
        moveIntention: jest.fn(),
      };
    });

    describe("渡されたテスト結果IDとシーケンス番号を用いてテスト目的を移動する", () => {
      afterEach(() => {
        expect(dispatcher.moveIntention).toBeCalledWith(
          testResultId,
          fromSequence,
          destSequence
        );
      });

      it("テスト目的の移動に成功した場合はオブザーバに結果を渡す", async () => {
        reply = {
          succeeded: true,
          data: new Note({}),
        };

        dispatcher = {
          moveIntention: jest.fn().mockResolvedValue(reply),
        };

        await new MoveIntentionAction(observer, dispatcher).move(
          testResultId,
          fromSequence,
          destSequence
        );

        expect(observer.moveIntention).toBeCalledWith(fromSequence, reply.data);
      });

      it("テスト目的の移動に失敗した場合はオブザーバに結果を渡さない", async () => {
        reply = {
          succeeded: false,
          error: {
            code: "errorCode",
            message: "errorMessage",
          },
        };

        dispatcher = {
          moveIntention: jest.fn().mockResolvedValue(reply),
        };

        await new MoveIntentionAction(observer, dispatcher).move(
          testResultId,
          fromSequence,
          destSequence
        );

        expect(observer.moveIntention).not.toBeCalled();
      });
    });
  });
});
