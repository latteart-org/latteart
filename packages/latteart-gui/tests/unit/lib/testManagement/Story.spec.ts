import { createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import * as StoryService from "@/lib/testManagement/Story";
import { Story, Session } from "@/lib/testManagement/types";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("Storyの", () => {
  describe("getTargetSessionは", () => {
    const session: Session = {
      index: 0,
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
      testPurposes: [],
      notes: [],
      testingTime: 0,
    };

    const story: Story = {
      index: 0,
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
});
