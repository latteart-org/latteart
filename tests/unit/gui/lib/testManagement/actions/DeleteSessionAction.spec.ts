import { SessionRepository } from "src/common";
import { RESTClient } from "src/common/network/http/client";
import { DeleteSessionAction } from "@/lib/testManagement/actions/DeleteSessionAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
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
        "api/v1/projects/projectId/sessions/sessionId"
      );

      expect(result.data).toEqual(undefined);
    });
  });
});
