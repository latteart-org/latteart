import { SessionRepository } from "@/lib/eventDispatcher/repositoryService/SessionRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";
import { DeleteSessionAction } from "@/lib/testManagement/actions/DeleteSessionAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("DeleteSessionAction", () => {
  describe("#deleteSession", () => {
    it("Sessionを削除する", async () => {
      const deleteSessionResponse = {
        ...baseRestClient,
        httpDelete: jest.fn().mockResolvedValue({
          status: 204,
        }),
      };

      const args = {
        projectId: "projectId",
        sessionId: "sessionId",
      };

      const result = await new DeleteSessionAction().deleteSession(args, {
        sessionRepository: new SessionRepository(deleteSessionResponse),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(deleteSessionResponse.httpDelete).toBeCalledWith(
        "/projects/projectId/sessions/sessionId"
      );

      expect(result.data).toEqual(undefined);
    });
  });
});
