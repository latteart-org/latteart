import { SessionRepository } from "latteart-client";
import { RESTClient } from "latteart-client";
import { AddNewSessionAction } from "@/lib/testManagement/actions/AddNewSessionAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
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
            index: 0,
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
            testPurposes: [],
            notes: [],
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
        serviceUrl: "serviceUrl",
      });

      if (result.isFailure()) {
        throw result.error;
      }

      expect(postSessionResponse.httpPost).toBeCalledWith(
        "api/v1/projects/projectId/sessions/",
        {
          storyId: "storyId",
        }
      );

      expect(result.data).toEqual({
        index: 0,
        name: "sessionId",
        id: "sessionId",
        isDone: false,
        doneDate: "",
        testItem: "",
        testerName: "",
        memo: "",
        attachedFiles: [],
        testResultFiles: [],
        initialUrl: "",
        testPurposes: [],
        notes: [],
        testingTime: 0,
      });
    });
  });
});
