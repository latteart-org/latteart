import { SettingsProvider } from "@/gateways/settings/SettingsProvider";
import path from "path";
import { ERR_MSG } from "@/gateways/settings/Constants";
import {
  RunningMode,
  Locale,
  ScreenDefType,
} from "@/gateways/settings/SettingsEnum";

const packageRootDirPath = path.join(__dirname, "..", "..");

describe("SettingsProvider", () => {
  let settingsProvider: SettingsProvider;

  beforeEach(() => {
    settingsProvider = new SettingsProvider();

    expect(settingsProvider.settings).toEqual({
      locale: "ja",
      mode: RunningMode.Debug,
      debug: {
        outputs: {
          dom: false,
        },
        saveItems: {
          keywordSet: false,
        },
        configureCaptureSettings: true,
      },
      defaultTagList: [],
      defaultTestHintProps: [],
      viewPointsPreset: [],
      config: {
        autofillSetting: {
          conditionGroups: [],
        },
        autoOperationSetting: {
          conditionGroups: [],
        },
        screenDefinition: {
          screenDefType: "title",
          conditionGroups: [],
        },
        coverage: {
          include: {
            tags: [],
          },
        },
        experimentalFeatureSetting: { captureArch: "polling" },
      },
      captureSettings: {
        ignoreTags: [],
      },
    });
  });

  describe("When the loadFile method is called, it reads the specified configuration file and assigns its contents to the settings field.", () => {
    const resourceDirPath = path.join(packageRootDirPath, "resources");

    it("normal", () => {
      const filePath = path.resolve(resourceDirPath, "latteart.config.json");

      settingsProvider.loadFile(filePath);

      expect(settingsProvider.settings).toEqual({
        locale: "ja",
        mode: RunningMode.Debug,
        debug: {
          outputs: {
            dom: false,
          },
          saveItems: {
            keywordSet: false,
          },
          configureCaptureSettings: true,
        },
        defaultTagList: [
          "H1",
          "H2",
          "P",
          "HR",
          "BLOCKQUOTE",
          "OL",
          "UL",
          "LI",
          "DL",
          "DT",
          "DD",
          "DIV",
          "STRONG",
          "SPAN",
          "IMG",
          "TABLE",
          "TR",
          "TD",
          "TH",
          "FORM",
          "LABEL",
          "SECTION",
          "NAV",
          "ARTICLE",
          "ASIDE",
          "H3",
          "H4",
          "HGROUP",
          "HEADER",
          "FOOTER",
          "ADDRESS",
          "PRE",
          "FIGURE",
          "FIGCAPTION",
          "EM",
          "SMALL",
          "CITE",
          "Q",
          "ABBR",
          "TIME",
          "CODE",
          "INS",
          "DEL",
          "IFRAME",
          "EMBED",
          "OBJECT",
          "VIDEO",
          "AUDIO",
          "CANVAS",
          "CAPTION",
          "TBODY",
          "THEAD",
          "TFOOT",
          "FIELDSET",
          "LEGEND",
          "H5",
          "H6",
          "S",
          "DFN",
          "VAR",
          "SAMP",
          "KBD",
          "SUB",
          "SUP",
          "I",
          "B",
          "U",
          "MARK",
          "RUBY",
          "RT",
          "BDI",
          "BDO",
          "MAP",
          "AREA",
          "OPTGROUP",
          "PROGRESS",
          "METER",
          "DETAILS",
          "SUMMARY",
          "MENU",
          "A",
          "INPUT",
          "SELECT",
          "OPTION",
          "TEXTAREA",
          "BUTTON",
          "DATALIST",
          "OUTPUT",
          "RP",
          "BODY",
        ],
        defaultTestHintProps: [
          {
            name: "ドメイン特化度",
            id: "001",
            type: "list",
            index: 0,
            listItems: [
              { key: "001-1", value: "1" },
              { key: "001-2", value: "2" },
              { key: "001-3", value: "3" },
              { key: "001-4", value: "4" },
              { key: "001-5", value: "5" },
            ],
          },
          {
            name: "バグ潜在時の重大度",
            id: "002",
            type: "list",
            index: 1,
            listItems: [
              { key: "002-1", value: "1" },
              { key: "002-2", value: "2" },
              { key: "002-3", value: "3" },
              { key: "002-4", value: "4" },
              { key: "002-5", value: "5" },
            ],
          },
          {
            name: "バグ潜在の頻度",
            id: "003",
            type: "list",
            index: 2,
            listItems: [
              { key: "003-1", value: "1" },
              { key: "003-2", value: "2" },
              { key: "003-3", value: "3" },
              { key: "003-4", value: "4" },
              { key: "003-5", value: "5" },
            ],
          },
          {
            name: "テストケースカテゴリ",
            id: "004",
            type: "list",
            index: 3,
            listItems: [
              { key: "004-1", value: "1" },
              { key: "004-2", value: "2" },
              { key: "004-3", value: "3" },
              { key: "004-4", value: "4" },
              { key: "004-5", value: "5" },
            ],
          },
        ],
        viewPointsPreset: [
          {
            name: "default",
            viewPoints: [
              { name: "基本フロー" },
              { name: "代替フロー" },
              { name: "例外フロー" },
              { name: "中断・再開・繰り返し" },
              { name: "データライフサイクル" },
              { name: "共有・排他・ロールセキュリティ" },
              { name: "入出力" },
            ],
          },
          {
            name: "preset1",
            viewPoints: [{ name: "プリセット１" }],
          },
        ],
        config: {
          autofillSetting: {
            conditionGroups: [],
          },
          autoOperationSetting: {
            conditionGroups: [],
          },
          screenDefinition: {
            screenDefType: "title",
            conditionGroups: [],
          },
          coverage: {
            include: {
              tags: [],
            },
          },

          experimentalFeatureSetting: { captureArch: "polling" },
        },
        captureSettings: {
          ignoreTags: [
            "HTML",
            "HEAD",
            "TITLE",
            "LINK",
            "META",
            "STYLE",
            "BASE",
            "SCRIPT",
            "NOSCRIPT",
            "BR",
            "WBR",
            "PARAM",
            "SOURCE",
            "TRACK",
            "COLGROUP",
            "COL",
          ],
        },
      });
    });

    it("Unallowed strings are set", () => {
      const filePath = path.resolve(
        resourceDirPath,
        "latteart.config.validate.json"
      );

      let message = "";
      try {
        settingsProvider.loadFile(filePath);
      } catch (error) {
        message = (error as Error).message;
      }

      expect(message).toEqual(
        `${ERR_MSG.SETTINGS.INVALID_SCREEN_DEF_TYPE} size`
      );
    });

    it("If the file does not exist, the default value will be set", () => {
      const filePath = path.resolve(resourceDirPath, "hogehoge.json");

      settingsProvider.loadFile(filePath);

      expect(settingsProvider.settings).toEqual({
        locale: "ja",
        mode: RunningMode.Debug,
        debug: {
          outputs: {
            dom: false,
          },
          saveItems: {
            keywordSet: false,
          },
          configureCaptureSettings: true,
        },
        defaultTagList: [],
        defaultTestHintProps: [],
        viewPointsPreset: [],
        config: {
          autofillSetting: {
            conditionGroups: [],
          },
          autoOperationSetting: {
            conditionGroups: [],
          },
          screenDefinition: {
            screenDefType: "title",
            conditionGroups: [],
          },
          coverage: {
            include: {
              tags: [],
            },
          },
          experimentalFeatureSetting: { captureArch: "polling" },
        },
        captureSettings: {
          ignoreTags: [],
        },
      });
    });
  });

  describe("When the getSedtting method is called, the setting value corresponding to the specified key character string is acquired from the possessed setting information and returned.", () => {
    it("If a key string that is not concatenated by a period is specified, the root hierarchy is searched.", () => {
      expect(settingsProvider.getSetting("mode")).toEqual(RunningMode.Debug);

      expect(settingsProvider.getSetting("debug")).toEqual({
        outputs: {
          dom: false,
        },
        saveItems: {
          keywordSet: false,
        },
        configureCaptureSettings: true,
      });

      expect(settingsProvider.getSetting("viewPointsPreset")).toEqual([]);

      expect(settingsProvider.getSetting("defaultTagList")).toEqual([]);
    });

    it("If a period-bound key string is specified, the child hierarchy is searched.", () => {
      expect(settingsProvider.getSetting("debug.outputs.dom")).toBeFalsy();
      expect(settingsProvider.getSetting("captureSettings.ignoreTags")).toEqual(
        []
      );
    });

    it("If the corresponding setting is not found, undefined is returned.", () => {
      expect(settingsProvider.getSetting("hoge")).toBeUndefined();

      expect(settingsProvider.getSetting("debug.outputs.hoge")).toBeUndefined();
    });
  });
  describe("Validation detects invalid settings", () => {
    it("normal", () => {
      // Do not throw error
      (settingsProvider as any).validate(settingsProvider.settings);
    });
    it("Incorrect screenDefType", () => {
      const screenDefType = "hoge" as ScreenDefType;
      settingsProvider.settings.config.screenDefinition.screenDefType =
        screenDefType;
      try {
        (settingsProvider as any).validate(settingsProvider.settings);
      } catch (error) {
        expect((error as Error).message).toEqual(
          `${ERR_MSG.SETTINGS.INVALID_SCREEN_DEF_TYPE} ${screenDefType}`
        );
      }
    });
    it("Locale is invalid", () => {
      const locale = "ch" as Locale;
      settingsProvider.settings.locale = locale;
      try {
        (settingsProvider as any).validate(settingsProvider.settings);
      } catch (error) {
        expect((error as Error).message).toEqual(
          `${ERR_MSG.SETTINGS.INVALID_LOCALE} ${locale}`
        );
      }
    });
    it("mode is invalid", () => {
      const mode = "develop" as RunningMode;
      settingsProvider.settings.mode = mode;
      try {
        (settingsProvider as any).validate(settingsProvider.settings);
      } catch (error) {
        expect((error as Error).message).toEqual(
          `${ERR_MSG.SETTINGS.INVALID_MODE} ${mode}`
        );
      }
    });
  });
});
