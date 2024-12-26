import type {
  AutofillSetting,
  AutoOperationSetting,
  CaptureMediaSetting,
  TestHintSetting
} from "@/lib/common/settings/Settings";
import {
  validateAutofillSetting,
  validateAutoOperationSetting,
  validateCaptureMediaSetting,
  validateTestHintSetting
} from "@/lib/common/settings/validateUserSettings";

describe("validateCaptureMediaSetting", () => {
  const captureMediaSetting: CaptureMediaSetting = {
    mediaType: "image",
    imageCompression: {
      format: "png"
    }
  };
  it("返却値がtrue", () => {
    expect(validateCaptureMediaSetting(captureMediaSetting)).toEqual(true);
  });
  describe("返却値がfalse", () => {
    it("mediaTypeが存在しない", () => {
      const testData: any = {
        ...captureMediaSetting
      };
      delete testData.mediaType;
      expect(validateCaptureMediaSetting(testData)).toEqual(false);
    });
    it("mediaTypeの値が不正", () => {
      const testData: any = {
        ...captureMediaSetting,
        mediaType: "movie"
      };
      expect(validateCaptureMediaSetting(testData)).toEqual(false);
    });
    it("imageCompressionが存在しない", () => {
      const testData: any = {
        ...captureMediaSetting
      };
      delete testData.imageCompression;
      expect(validateCaptureMediaSetting(testData)).toEqual(false);
    });
    it("imageCompression.formatが存在しない", () => {
      const testData: any = {
        ...captureMediaSetting
      };
      delete testData.imageCompression.format;
      expect(validateCaptureMediaSetting(testData)).toEqual(false);
    });
    it("imageCompression.formatの値が不正", () => {
      const testData: any = {
        ...captureMediaSetting,
        imageCompression: {
          format: "gif"
        }
      };
      delete testData.imageCompression.format;
      expect(validateCaptureMediaSetting(testData)).toEqual(false);
    });
  });
});
describe("validateAutofillSetting", () => {
  const autofillSetting: AutofillSetting = {
    autoPopupRegistrationDialog: true,
    autoPopupSelectionDialog: true,
    conditionGroups: [
      {
        isEnabled: true,
        settingName: "name",
        url: "http://example.com",
        title: "web title",
        inputValueConditions: [
          {
            isEnabled: true,
            locatorType: "id",
            locator: "idid",
            locatorMatchType: "equals",
            inputValue: "val",
            iframeIndex: 1
          }
        ]
      }
    ]
  };
  describe("返却値がtrue", () => {
    it("iframeIndex有り", () => {
      expect(validateAutofillSetting(autofillSetting)).toEqual(true);
    });
    it("iframeIndex無し", () => {
      const testData: any = {
        ...autofillSetting
      };
      delete testData.conditionGroups[0].inputValueConditions[0].iframeIndex;
      expect(validateAutofillSetting(testData)).toEqual(true);
    });
  });
  describe("返却値がfalse", () => {
    it("autoPopupRegistrationDialogの値が不正", () => {
      const testData: any = {
        ...autofillSetting,
        autoPopupRegistrationDialog: "aaa"
      };
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("autoPopupSelectionDialogの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      delete testData.autoPopupSelectionDialog;
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroupsの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      delete testData.conditionGroups;
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroups.isEnabledの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      testData.conditionGroups[0].isEnabled = "aaa";
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroups.locatorTypeの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      testData.conditionGroups[0].locatorType = "class";
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroups.locatorの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      testData.conditionGroups[0].locator = 100;
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroups.locatorMatchTypeの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      testData.conditionGroups[0].locatorMatchType = "aaa";
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroups.inputValueの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      testData.conditionGroups[0].inputValue = 100;
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
    it("conditionGroups.iframeIndexの値が不正", () => {
      const testData: any = {
        ...autofillSetting
      };
      testData.conditionGroups[0].iframeIndex = "aaa";
      expect(validateAutofillSetting(testData)).toEqual(false);
    });
  });
});
describe("validateAutoOperationSetting", () => {
  const autoOperationSetting: AutoOperationSetting = {
    conditionGroups: [
      {
        isEnabled: true,
        settingName: "name",
        details: "details",
        autoOperations: []
      }
    ]
  };
  describe("返却値がtrue", () => {
    it("conditionGroups.details有り", () => {
      expect(validateAutoOperationSetting(autoOperationSetting)).toEqual(true);
    });
    it("conditionGroups.details無し", () => {
      const testData = {
        ...autoOperationSetting
      };
      delete testData.conditionGroups[0].details;
      expect(validateAutoOperationSetting(testData)).toEqual(true);
    });
  });
  describe("返却値がfalse", () => {
    it("conditionGroupsの値が不正", () => {
      const testData = {
        conditionGroups: "aaa"
      };
      expect(validateAutoOperationSetting(testData)).toEqual(false);
    });
    it("conditionGroups.isEnabledの値が不正", () => {
      const testData: any = {
        ...autoOperationSetting
      };
      testData.conditionGroups[0].isEnabled = "aaa";
      expect(validateAutoOperationSetting(testData)).toEqual(false);
    });
    it("conditionGroups.settingNameの値が不正", () => {
      const testData: any = {
        ...autoOperationSetting
      };
      testData.conditionGroups[0].settingName = 100;
      expect(validateAutoOperationSetting(testData)).toEqual(false);
    });
    it("conditionGroups.detailsの値が不正", () => {
      const testData: any = {
        ...autoOperationSetting
      };
      testData.conditionGroups[0].details = 100;
      expect(validateAutoOperationSetting(testData)).toEqual(false);
    });
    it("conditionGroups.autoOperationsの値が不正", () => {
      const testData: any = {
        ...autoOperationSetting
      };
      testData.conditionGroups[0].autoOperations = 100;
      expect(validateAutoOperationSetting(testData)).toEqual(false);
    });
  });
});
describe("validateTestHintSetting", () => {
  const testHintSetting: TestHintSetting = {
    commentMatching: {
      target: "all",
      excludedWords: ["excludeWord"],
      extraWords: ["extraWord"]
    },
    defaultSearchSeconds: 100
  };
  it("返却値がtrue", () => {
    expect(validateTestHintSetting(testHintSetting)).toEqual(true);
  });
  describe("返却値がfalse", () => {
    it("commentMatchingが存在しない", () => {
      const testData: any = {
        ...testHintSetting
      };
      delete testData.commentMatching;
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
    it("commentMatching.targetの値が不正", () => {
      const testData: any = {
        ...testHintSetting
      };
      testData.commentMatching.target = "aaa";
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
    it("commentMatching.extraWordsの値が不正", () => {
      const testData: any = {
        ...testHintSetting
      };
      testData.commentMatching.extraWords = "aaa";
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
    it("commentMatching.extraWordsの配列の値が不正", () => {
      const testData: any = {
        ...testHintSetting
      };
      testData.commentMatching.extraWords = [100];
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
    it("commentMatching.excludedWordsの値が不正", () => {
      const testData: any = {
        ...testHintSetting
      };
      testData.commentMatching.excludedWords = "bbb";
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
    it("commentMatching.excludedWordsの配列の値が不正", () => {
      const testData: any = {
        ...testHintSetting
      };
      testData.commentMatching.excludedWords = [200];
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
    it("defaultSearchSecondsの値が不正", () => {
      const testData: any = {
        ...testHintSetting
      };
      testData.commentMatching.defaultSearchSeconds = "ccc";
      expect(validateTestHintSetting(testData)).toEqual(false);
    });
  });
});
