import { createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import { Operation } from "@/lib/operationHistory/Operation";
import * as StoryService from "@/lib/testManagement/Story";
import { Story, Session } from "@/lib/testManagement/types";
import { OperationWithNotes } from "@/lib/operationHistory/types";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("Storyの", () => {
  describe("getTargetSessionは", () => {
    const session: Session = {
      id: "s001",
      name: "session1",
      isDone: true,
      doneDate: "",
      testItem: "",
      testerName: "",
      memo: "",
      attachedFiles: [],
      testResultFiles: [],
      initialUrl: "",
      issues: [],
      intentions: [],
    };

    const story: Story = {
      sessions: [session],
      status: "",
      id: "",
      testMatrixId: "",
      testTargetId: "",
      viewPointId: "",
    };

    it("story内にsessionIdに一致するsessionが存在する場合、該当sessionを返す", () => {
      expect(StoryService.getTargetSession(story, "s001")).toEqual(session);
    });

    it("story内にsessionIdに一致するsessionが存在しない場合、nullを返す", () => {
      expect(StoryService.getTargetSession(story, "s002")).toBeNull();
    });
  });

  describe("extractWindowHandleInSessionは", () => {
    const operationWithNotes1: OperationWithNotes = {
      operation: new Operation(
        1,
        "",
        "",
        null,
        "",
        "",
        "",
        "",
        "windowHandle1"
      ),
      intention: null,
      bugs: null,
      notices: null,
    };
    const operationWithNotes2: OperationWithNotes = {
      operation: new Operation(
        2,
        "",
        "",
        null,
        "",
        "",
        "",
        "",
        "windowHandle2"
      ),
      intention: null,
      bugs: null,
      notices: null,
    };
    const session: Session = {
      id: "s001",
      name: "session1",
      isDone: true,
      doneDate: "",
      testItem: "",
      testerName: "",
      memo: "",
      attachedFiles: [],
      testResultFiles: [{ name: "logJsonStory.json", id: "testResult01" }],
      initialUrl: "",
      issues: [],
      intentions: [],
    };
  });
});
