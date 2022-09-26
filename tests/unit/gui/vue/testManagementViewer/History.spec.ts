import { createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";

import * as History from "@/lib/testManagement/History";
import { Story, Issue, Session } from "@/lib/testManagement/types";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("Historyは", () => {
  describe("getTargetSessionで", () => {
    const session1 = {
      name: "session1",
      id: "s1",
      isDone: false,
      doneDate: "",
      testerName: "",
      testItem: "",
      memo: "",
      attachedFiles: [],
      history: [],
      initialUrl: "",
      issues: [],
      intentions: [],
    };
    const session2 = {
      name: "session2",
      id: "s2",
      isDone: false,
      doneDate: "",
      testerName: "",
      testItem: "",
      memo: "",
      attachedFiles: [],
      history: [],
      initialUrl: "",
      issues: [],
      intentions: [],
    };
    const session3 = {
      name: "session3",
      id: "s3",
      isDone: false,
      doneDate: "",
      testerName: "",
      testItem: "",
      memo: "",
      attachedFiles: [],
      history: [],
      initialUrl: "",
      issues: [],
      intentions: [],
    };

    const story: Story = {
      id: "c1",
      index: 0,
      testMatrixId: "",
      testTargetId: "",
      viewPointId: "",
      status: "",
      sessions: [session1, session2, session3],
    };

    it("対象Sessionが存在する場合、Sessionを返す", () => {
      expect(History.getTargetSession(story, "s2")).toEqual(session2);
    });

    it("対象Sessionが存在しない場合、nullを返す", () => {
      expect(History.getTargetSession(story, "s4")).toBeNull();
    });
  });

  describe("getTargetIssueで", () => {
    const issue1: Issue = {
      source: { type: "bug", sequence: 1, index: 0 },
      status: "",
      ticketId: "",
      value: "",
      details: "",
      imageFilePath: "",
    };
    const issue2: Issue = {
      source: { type: "bug", sequence: 1, index: 1 },
      status: "",
      ticketId: "",
      value: "",
      details: "",
      imageFilePath: "",
    };
    const issue3: Issue = {
      source: { type: "notice", sequence: 1, index: 2 },
      status: "",
      ticketId: "",
      value: "",
      details: "",
      imageFilePath: "",
    };
    const session: Session = {
      name: "session1",
      id: "s1",
      isDone: false,
      doneDate: "",
      testerName: "",
      testItem: "",
      memo: "",
      attachedFiles: [],
      initialUrl: "",
      issues: [issue1, issue2, issue3],
      intentions: [],
    };

    it("対象Issueが存在する場合、Issueを返す", () => {
      expect(
        History.getTargetIssue(session, {
          id: "1",
          sequence: 1,
          index: 1,
          type: "bug",
        })
      ).toEqual(issue2);
    });

    it("対象Issueが存在しない場合、nullを返す", () => {
      expect(
        History.getTargetIssue(session, {
          id: "1",
          sequence: 1,
          index: 1,
          type: "notice",
        })
      ).toBeNull();
    });
  });

  describe("changeIssueStatusで", () => {
    const issue1 = {
      source: { type: "bug", sequence: 1, index: 0 },
      status: "",
      ticketId: "",
      value: "",
      details: "",
      imageFilePath: "",
    };
    const issue2 = {
      source: { type: "notice", sequence: 1, index: 2 },
      status: "",
      ticketId: "",
      value: "",
      details: "",
      imageFilePath: "",
    };

    it("引数にticketIdがある場合、tickedIdとstatusを更新する", () => {
      const issues: Issue[] = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "",
          ticketId: "",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];

      const resultIssues = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "reported",
          ticketId: "123",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];
      expect(
        History.changeIssueStatus(
          issues,
          { sequence: 1, index: 1, type: "bug" },
          "reported",
          "123"
        )
      ).toEqual(resultIssues);
    });

    it("引数のticketIdが空文字の場合、statusを更新する", () => {
      const issues: Issue[] = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "",
          ticketId: "",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];

      const resultIssues = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "reported",
          ticketId: "",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];
      expect(
        History.changeIssueStatus(
          issues,
          { sequence: 1, index: 1, type: "bug" },
          "reported",
          ""
        )
      ).toEqual(resultIssues);
    });
    it("引数にticketIdが指定されていない場合、statusを更新する", () => {
      const issues: Issue[] = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "",
          ticketId: "",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];

      const resultIssues = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "reported",
          ticketId: "",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];
      expect(
        History.changeIssueStatus(
          issues,
          { sequence: 1, index: 1, type: "bug" },
          "reported"
        )
      ).toEqual(resultIssues);
    });

    it("引数のstatusが空文字でticketIdを指定した場合、ticketIdのみ更新される", () => {
      const issues: Issue[] = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "reported",
          ticketId: "123",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];

      const resultIssues = [
        issue1,
        {
          source: { type: "bug", sequence: 1, index: 1 },
          status: "reported",
          ticketId: "456",
          value: "",
          details: "",
          imageFilePath: "",
        },
        issue2,
      ];
      expect(
        History.changeIssueStatus(
          issues,
          { sequence: 1, index: 1, type: "bug" },
          "",
          "456"
        )
      ).toEqual(resultIssues);
    });
  });
});
