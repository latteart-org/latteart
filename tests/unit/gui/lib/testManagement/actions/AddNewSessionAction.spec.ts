import { SessionRepository } from "@/lib/eventDispatcher/repositoryService/SessionRepository";
import { RESTClient } from "@/lib/eventDispatcher/RESTClient";
import { AddNewSessionAction } from "@/lib/testManagement/actions/AddNewSessionAction";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("AddNewSessionAction", () => {
  describe("#addNewSession", () => {
    it("Sessionを追加する", async () => {
      const postSessionResponse = {
        ...baseRestClient,
        httpPost: jest.fn().mockResolvedValue({
          status: 200,
          data: {
            name: "",
            id: "sessionId",
            isDone: false,
            doneDate: "",
            testItem: "",
            testerName: "",
            memo: "",
            attachedFiles: [],
            testResultFiles: [],
            initialUrl: "",
            issues: [],
            intentions: [],
            testingTime: 0,
          },
        }),
      };

      const args = {
        projectId: "projectId",
        storyId: "storyId",
      };

      const result = await new AddNewSessionAction().addNewSession(args, {
        sessionRepository: new SessionRepository(postSessionResponse),
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(postSessionResponse.httpPost).toBeCalledWith(
        "/projects/projectId/sessions/",
        {
          storyId: "storyId",
        }
      );

      expect(result.data).toEqual({
        attachedFiles: [],
        doneDate: "",
        id: "sessionId",
        initialUrl: "",
        intentions: [],
        isDone: false,
        issues: [],
        memo: "",
        name: "",
        testItem: "",
        testResultFiles: [],
        testerName: "",
        testingTime: 0,
      });
    });
  });
});
