import { MoveTestPurposeAction } from "@/lib/operationHistory/actions/testPurpose/MoveTestPurposeAction";
import { Note } from "@/lib/operationHistory/Note";
import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";
import {
  RepositoryAccessSuccess,
  RepositoryAccessFailure,
  RepositoryAccessFailureType,
  ServerError,
} from "@/lib/captureControl/Reply";

describe("MoveTestPurposeAction", () => {
  describe("#move", () => {
    let testStepRepository: TestStepRepository;
    let noteRepository: NoteRepository;
    let repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >;

    const testResultId = "testResultId";
    const fromTestStepId = "fromTestStepId";
    const destTestStepId = "destTestStepId";

    const testStepReply = {
      data: {
        id: "1",
        operation: {},
        intention: "intention1",
        bugs: null,
        notices: null,
      },
    };

    const breakReply = {
      data: {
        id: "2",
        operation: {},
        intention: null,
        bugs: null,
        notices: null,
      },
    };

    const moveReply = {
      data: {
        id: "2",
        operation: {},
        intention: "intention1",
        bugs: null,
        notices: null,
      },
    };

    describe("指定のテストステップに紐づくテスト目的を別のテストステップに付け替える", () => {
      it("テスト目的の移動に成功した場合は移動されたテスト目的を返す", async () => {
        const reply = {
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

        const result = await new MoveTestPurposeAction(
          repositoryContainer
        ).move(testResultId, fromTestStepId, destTestStepId);

        if (result.isFailure()) {
          throw new Error("failed");
        }

        expect(result.data).toEqual(reply.data);
      });

      it("テスト目的の付け替えに失敗した場合はエラー情報を返す", async () => {
        const reply: { type: RepositoryAccessFailureType; error: ServerError } =
          {
            type: "InternalServerError",
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

        const result = await new MoveTestPurposeAction(
          repositoryContainer
        ).move(testResultId, fromTestStepId, destTestStepId);

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
