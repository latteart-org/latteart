import {
  MoveIntentionAction,
  MoveIntentionActionObserver,
} from "@/lib/operationHistory/actions/intention/MoveIntentionAction";
import { Note } from "@/lib/operationHistory/Note";
import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";
import {
  RepositoryAccessSuccess,
  RepositoryAccessFailure,
} from "@/lib/captureControl/Reply";

describe("MoveIntentionAction", () => {
  describe("#move", () => {
    let observer: MoveIntentionActionObserver;
    let testStepRepository: TestStepRepository;
    let noteRepository: NoteRepository;
    let repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >;

    const testResultId = "testResultId";
    const fromSequence = 0;
    const destSequence = 0;

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

    const breakReply = {
      status: 200,
      data: {
        id: "2",
        operation: {},
        intention: null,
        bugs: null,
        notices: null,
      },
    };

    const moveReply = {
      status: 200,
      data: {
        id: "2",
        operation: {},
        intention: "intention1",
        bugs: null,
        notices: null,
      },
    };

    beforeEach(() => {
      observer = {
        moveIntention: jest.fn(),
        getTestStepId: jest.fn().mockImplementation((sequence) => {
          return `id_of_${sequence}`;
        }),
      };
    });

    describe("渡されたテスト結果IDとシーケンス番号を用いてテスト目的を移動する", () => {
      afterEach(() => {
        expect(
          repositoryContainer.testStepRepository.getTestSteps
        ).toBeCalledWith(testResultId, `id_of_${fromSequence}`);
      });

      it("テスト目的の移動に成功した場合はオブザーバに結果を渡す", async () => {
        const reply = {
          status: 200,
          data: new Note({}),
        };

        testStepRepository = {
          getTestSteps: jest
            .fn()
            .mockResolvedValue(new RepositoryAccessSuccess(testStepReply)),
          patchTestSteps: jest
            .fn()
            .mockResolvedValueOnce(new RepositoryAccessSuccess(breakReply))
            .mockResolvedValueOnce(new RepositoryAccessSuccess(moveReply)),
          postTestSteps: jest.fn(),
        };

        noteRepository = {
          getNotes: jest
            .fn()
            .mockResolvedValue(new RepositoryAccessSuccess(reply)),
          postNotes: jest.fn(),
          putNotes: jest.fn(),
          deleteNotes: jest.fn(),
        };

        repositoryContainer = {
          testStepRepository,
          noteRepository,
          serviceUrl: "serviceUrl",
        };

        const result = await new MoveIntentionAction(
          observer,
          repositoryContainer
        ).move(testResultId, fromSequence, destSequence);

        expect(observer.moveIntention).toBeCalledWith(fromSequence, reply.data);

        if (result.isFailure()) {
          throw new Error("failed");
        }
      });

      it("テスト目的の移動に失敗した場合はオブザーバに結果を渡さない", async () => {
        const reply = {
          status: 500,
          error: {
            code: "errorCode",
            message: "errorMessage",
          },
        };

        testStepRepository = {
          getTestSteps: jest
            .fn()
            .mockResolvedValue(new RepositoryAccessSuccess(testStepReply)),
          patchTestSteps: jest
            .fn()
            .mockResolvedValueOnce(new RepositoryAccessSuccess(breakReply))
            .mockResolvedValueOnce(new RepositoryAccessSuccess(moveReply)),
          postTestSteps: jest.fn(),
        };

        noteRepository = {
          getNotes: jest
            .fn()
            .mockResolvedValue(new RepositoryAccessFailure(reply)),
          postNotes: jest.fn(),
          putNotes: jest.fn(),
          deleteNotes: jest.fn(),
        };

        repositoryContainer = {
          testStepRepository,
          noteRepository,
          serviceUrl: "serviceUrl",
        };

        const result = await new MoveIntentionAction(
          observer,
          repositoryContainer
        ).move(testResultId, fromSequence, destSequence);

        expect(observer.moveIntention).not.toBeCalled();

        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.operation_history.move_test_purpose_failed",
          });
        }
      });
    });
  });
});
