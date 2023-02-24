import ScreenTransitionHistory from "@/capturer/browser/window/ScreenTransitionHistory";

describe("ScreenTransitionHistoryは", () => {
  describe("addが呼ばれたとき、指定のURLを履歴に追加し、そのURLを新しくカレントに設定する", () => {
    let screenTransitionHistory: ScreenTransitionHistory;

    beforeEach(() => {
      screenTransitionHistory = new ScreenTransitionHistory();
    });

    it("カレントが履歴の終端を指していた場合はそのまま末尾に追加する", () => {
      screenTransitionHistory.add("hoge");
      expect(screenTransitionHistory.urls).toEqual(["hoge"]);
      expect(screenTransitionHistory.getCurrentUrl()).toEqual("hoge");
    });

    it("カレントが履歴の終端を指していない場合はその直後に挿入し、以降は削除する", () => {
      screenTransitionHistory.add("hoge");
      screenTransitionHistory.add("huga");
      screenTransitionHistory.back();

      screenTransitionHistory.add("piyo");
      expect(screenTransitionHistory.urls).toEqual(["hoge", "piyo"]);
      expect(screenTransitionHistory.getCurrentUrl()).toEqual("piyo");
    });

    it("ロックされている場合は追加しない", () => {
      screenTransitionHistory.lock();
      screenTransitionHistory.add("hoge");

      expect(screenTransitionHistory.urls).toEqual([]);
      expect(screenTransitionHistory.getCurrentUrl()).toEqual("");
    });

    it("一度ロックされてもロック解除された場合は追加する", () => {
      screenTransitionHistory.lock();
      screenTransitionHistory.add("hoge");
      screenTransitionHistory.unlock();
      screenTransitionHistory.add("huga");

      expect(screenTransitionHistory.urls).toEqual(["huga"]);
      expect(screenTransitionHistory.getCurrentUrl()).toEqual("huga");
    });
  });

  it("backが呼ばれたとき、履歴を1つ戻る", () => {
    const screenTransitionHistory = new ScreenTransitionHistory();

    expect(screenTransitionHistory.getCurrentUrl()).toEqual("");

    screenTransitionHistory.back();

    // 履歴に1つもない場合は空文字
    expect(screenTransitionHistory.getCurrentUrl()).toEqual("");

    screenTransitionHistory.add("hoge");
    screenTransitionHistory.back();

    // 履歴に1つある場合は1個目より前には戻らない
    expect(screenTransitionHistory.getCurrentUrl()).toEqual("hoge");

    screenTransitionHistory.add("huga");
    screenTransitionHistory.back();

    // 履歴に2つ以上ある場合は1つ前に戻る
    expect(screenTransitionHistory.getCurrentUrl()).toEqual("hoge");
  });

  it("forwardが呼ばれたとき、履歴を1つ進む", () => {
    const screenTransitionHistory = new ScreenTransitionHistory();
    screenTransitionHistory.add("hoge");
    screenTransitionHistory.add("huga");

    expect(screenTransitionHistory.getCurrentUrl()).toEqual("huga");

    screenTransitionHistory.forward();

    // カレントが終端の場合はそれ以上進まない
    expect(screenTransitionHistory.getCurrentUrl()).toEqual("huga");

    screenTransitionHistory.back();
    screenTransitionHistory.forward();

    // 終端出ない場合は1つ進む
    expect(screenTransitionHistory.getCurrentUrl()).toEqual("huga");
  });
});
