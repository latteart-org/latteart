import {
  extractProjectData,
  extractTestResultsData,
} from "@/domain/dataExtractor";

describe("dataExtractor", () => {
  describe("#extractTestResultsData", () => {
    it("テスト実行結果データの抽出", () => {
      const testResultFiles = [
        {
          filePath: "test-results/testResultId1/log.json",
          data: "{1}",
        },
        {
          filePath: "test-results/testResultId1/aaaa.webp",
          data: Buffer.from(""),
        },
        {
          filePath: "test-results/testResultId2/log.json",
          data: "{2}",
        },
        {
          filePath: "test-results/testResultId2/bbbb.webp",
          data: Buffer.from(""),
        },
      ];
      const result = extractTestResultsData(testResultFiles);
      expect(result).toEqual([
        {
          screenshots: [{ data: Buffer.from(""), filePath: "aaaa.webp" }],
          testResultFile: {
            data: "{1}",
            fileName: "test-results/testResultId1/log.json",
          },
          testResultId: "testResultId1",
        },
        {
          screenshots: [{ data: Buffer.from(""), filePath: "bbbb.webp" }],
          testResultFile: {
            data: "{2}",
            fileName: "test-results/testResultId2/log.json",
          },
          testResultId: "testResultId2",
        },
      ]);
    });
  });

  describe("#extractProjectData", () => {
    it("プロジェクトデータの抽出", () => {
      const files = [
        {
          filePath: "projects/projectId1/project.json",
          data: "{}",
        },
        {
          filePath: "projects/projectId1/progress.json",
          data: "{}",
        },
        {
          filePath: "projects/projectId1/storyId1/sessionId1/aaa.webp",
          data: "",
        },
        {
          filePath: "projects/projectId1/storyId1/sessionId2/bbb.webp",
          data: "",
        },
        {
          filePath: "projects/projectId1/storyId2/sessionId1/ccc.webp",
          data: "",
        },
      ];
      const result = extractProjectData(files);

      const projectData = {
        projectId: "projectId1",
        projectFile: { fileName: "project.json", data: "{}" },
        stories: [
          {
            storyId: "storyId1",
            sessions: [
              {
                sessionId: "sessionId1",
                attachedFiles: [
                  {
                    filePath:
                      "projects/projectId1/storyId1/sessionId1/aaa.webp",
                    data: "",
                  },
                ],
              },
              {
                sessionId: "sessionId2",
                attachedFiles: [
                  {
                    filePath:
                      "projects/projectId1/storyId1/sessionId2/bbb.webp",
                    data: "",
                  },
                ],
              },
            ],
          },
          {
            storyId: "storyId2",
            sessions: [
              {
                sessionId: "sessionId1",
                attachedFiles: [
                  {
                    filePath:
                      "projects/projectId1/storyId2/sessionId1/ccc.webp",
                    data: "",
                  },
                ],
              },
            ],
          },
        ],
        progressesFile: { fileName: "progress.json", data: "{}" },
      };
      expect(result).toEqual(projectData);
    });
  });
});
