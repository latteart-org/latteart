import {
  buildCommentMatchingWords,
  extractTestHintResources
} from "@/lib/common/testHintResourceHelper";

describe("extractTestHintResources", () => {
  describe("testStepsからテストヒントに紐づける情報を抽出する", () => {
    describe("testSteps内のcommentsのvalueを半角スペースで区切り、コメント内のワードを抽出する", () => {
      it("全てのcommentsのvalueから取得する", () => {
        const testSteps = [
          {
            operation: {
              elementInfo: null
            },
            comments: [{ value: "word1 word2" }, { value: "word3" }],
            issues: []
          },
          {
            operation: {
              elementInfo: null
            },
            comments: [{ value: "word4" }],
            issues: []
          },
          {
            operation: {
              elementInfo: null
            },
            comments: [{ value: "" }],
            issues: []
          },
          {
            operation: {
              elementInfo: null
            },
            comments: [],
            issues: []
          }
        ];

        const result = extractTestHintResources(testSteps);

        expect(result).toEqual({
          commentWords: ["word1", "word2", "word3", "word4"],
          displayedWords: [],
          elements: [],
          issues: []
        });
      });

      it("同じワードが複数存在する場合は同一のワードとしてまとめる", () => {
        const testSteps = [
          {
            operation: {
              elementInfo: null
            },
            comments: [{ value: "word1 word1" }, { value: "word1" }],
            issues: []
          },
          {
            operation: {
              elementInfo: null
            },
            comments: [{ value: "word1" }],
            issues: []
          }
        ];

        const result = extractTestHintResources(testSteps);

        expect(result).toEqual({
          commentWords: ["word1"],
          displayedWords: [],
          elements: [],
          issues: []
        });
      });
    });

    describe("testSteps内のoperation.keywordSetを半角スペースで区切り、画面に表示されているワードとして抽出する", () => {
      it("全てのoperationのkeywordSetから取得する", () => {
        const testSteps = [
          {
            operation: { elementInfo: null, keywordSet: new Set(["word1 word2", "word3"]) },
            comments: [],
            issues: []
          },
          {
            operation: { elementInfo: null, keywordSet: new Set(["word4"]) },
            comments: [],
            issues: []
          },
          {
            operation: { elementInfo: null, keywordSet: new Set([]) },
            comments: [],
            issues: []
          },
          {
            operation: { elementInfo: null },
            comments: [],
            issues: []
          }
        ];

        const result = extractTestHintResources(testSteps);

        expect(result).toEqual({
          commentWords: [],
          displayedWords: ["word1", "word2", "word3", "word4"],
          elements: [],
          issues: []
        });
      });

      it("同じワードが複数存在する場合は同一のワードとしてまとめる", () => {
        const testSteps = [
          {
            operation: {
              elementInfo: null,
              keywordSet: new Set(["word1 word1", "word1"])
            },
            comments: [],
            issues: []
          },
          {
            operation: {
              elementInfo: null,
              keywordSet: new Set(["word1"])
            },
            comments: [],
            issues: []
          }
        ];

        const result = extractTestHintResources(testSteps);

        expect(result).toEqual({
          commentWords: [],
          displayedWords: ["word1"],
          elements: [],
          issues: []
        });
      });
    });

    describe("testSteps内のoperation.elementInfoからtagname、attributes.type、textを要素情報として抽出する", () => {
      it("全てのoperationのelementInfoから取得する", () => {
        const testSteps = [
          {
            operation: {
              elementInfo: {
                tagname: "tagname1",
                attributes: { type: "type1" },
                text: "text1"
              }
            },
            comments: [],
            issues: []
          },
          {
            operation: {
              elementInfo: {
                tagname: "tagname2",
                attributes: { type: "type2" },
                text: "text2"
              }
            },
            comments: [],
            issues: []
          }
        ];

        const result = extractTestHintResources(testSteps);

        expect(result).toEqual({
          commentWords: [],
          displayedWords: [],
          elements: [
            { tagname: "tagname1", type: "type1", text: "text1" },
            { tagname: "tagname2", type: "type2", text: "text2" }
          ],
          issues: []
        });
      });

      it("tagname、attributes.type、textの組み合わせが完全に同じ要素が存在する場合は同一の要素としてまとめる", () => {
        const testSteps = [
          {
            operation: {
              elementInfo: {
                tagname: "tagname1",
                attributes: { type: "type1" },
                text: "text1"
              }
            },
            comments: [],
            issues: []
          },
          {
            operation: {
              elementInfo: {
                tagname: "tagname1",
                attributes: { type: "type1" },
                text: "text1"
              }
            },
            comments: [],
            issues: []
          }
        ];

        const result = extractTestHintResources(testSteps);

        expect(result).toEqual({
          commentWords: [],
          displayedWords: [],
          elements: [{ tagname: "tagname1", type: "type1", text: "text1" }],
          issues: []
        });
      });
    });
  });
});

describe("buildCommentMatchingWords", () => {
  describe("渡されたtestHintResourcesとcommentMatchingConfigを元にコメントのマッチングに使用するワード群を構築する", () => {
    describe("commentMatchingConfigのtargetが'all'の場合は、commentWords内のすべての文字列を対象にする", () => {
      it("extraWordsとexcludedWordsが両方指定されていない場合は対象となるすべての文字列を返す", () => {
        const testHintResource = {
          commentWords: ["word1"],
          displayedWords: []
        };
        const commentMatchingConfig = {
          target: "all" as const,
          extraWords: [],
          excludedWords: []
        };

        const result = buildCommentMatchingWords(testHintResource, commentMatchingConfig);

        expect(result).toEqual(["word1"]);
      });

      it("excludedWordsが指定されている場合は対象となる文字列の内、excludedWords内の文字列と合致しないもののみを返す", () => {
        const testHintResource = {
          commentWords: ["word1", "word2", "word3"],
          displayedWords: []
        };
        const commentMatchingConfig = {
          target: "all" as const,
          extraWords: [],
          excludedWords: ["word1", "word2"]
        };

        const result = buildCommentMatchingWords(testHintResource, commentMatchingConfig);

        expect(result).toEqual(["word3"]);
      });

      it("extraWordsは指定されていても影響せず、対象となる文字列のみを返す", () => {
        const testHintResource = {
          commentWords: ["word1"],
          displayedWords: []
        };
        const commentMatchingConfig = {
          target: "all" as const,
          extraWords: ["extraWord"],
          excludedWords: []
        };

        const result = buildCommentMatchingWords(testHintResource, commentMatchingConfig);

        expect(result).toEqual(["word1"]);
      });
    });

    describe("commentMatchingConfigのtargetが'wordsOnPageOnly'の場合は、commentWordsの内、displayedWords内の各文字列に部分一致するもののみを対象とする", () => {
      it("extraWordsとexcludedWordsが両方指定されていない場合は対象となるすべての文字列を返す", () => {
        const testHintResource = {
          commentWords: ["word1", "word2", "word11"],
          displayedWords: ["word11"]
        };
        const commentMatchingConfig = {
          target: "wordsOnPageOnly" as const,
          extraWords: [],
          excludedWords: []
        };

        const result = buildCommentMatchingWords(testHintResource, commentMatchingConfig);

        expect(result).toEqual(["word11"]);
      });

      it("excludedWordsが指定されている場合は対象となる文字列の内、excludedWords内の文字列と合致しないもののみを返す", () => {
        const testHintResource = {
          commentWords: ["word1", "word2", "word11", "word111"],
          displayedWords: ["word111"]
        };
        const commentMatchingConfig = {
          target: "wordsOnPageOnly" as const,
          extraWords: [],
          excludedWords: ["word1", "word11"]
        };

        const result = buildCommentMatchingWords(testHintResource, commentMatchingConfig);

        expect(result).toEqual(["word111"]);
      });

      it("extraWordsが指定されているwordはdisplayedWordsに含まれていなくてもcommentWordsに含まれていればそれを返す", () => {
        const testHintResource = {
          commentWords: ["word1", "word2", "word11"],
          displayedWords: ["word1"]
        };
        const commentMatchingConfig = {
          target: "wordsOnPageOnly" as const,
          extraWords: ["word2", "word3"],
          excludedWords: []
        };

        const result = buildCommentMatchingWords(testHintResource, commentMatchingConfig);

        expect(result).toEqual(["word1", "word2"]);
      });
    });
  });
});
