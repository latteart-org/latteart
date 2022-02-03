import { formatTime, TimestampImpl } from "@/lib/common/Timestamp";

describe("#formatTime", () => {
  it("渡された経過時間を「HH:mm:ss」のフォーマットで値を返す", async () => {
    const time = 30474;

    const returnTime: string = formatTime(time);

    expect(returnTime).toEqual("00:00:30");
  });
});

describe("Timestamp", () => {
  describe("#unix", () => {
    it("渡された時間(秒)をunixで値を返す", async () => {
      const timestamp = 1643335656;

      const returnTime: number = new TimestampImpl(timestamp).unix();

      expect(returnTime).toEqual(1643335656);
    });

    it("渡された時間(ミリ秒)をunixで値を返す", async () => {
      const timestamp = 1643335656000;

      const returnTime: number = new TimestampImpl(timestamp).unix();

      expect(returnTime).toEqual(1643335656);
    });
  });

  describe("#format", () => {
    it("渡された時間(秒)を指定されたフォーマットで値を返す", async () => {
      const timestamp = 1643335656;

      const returnDate: string = new TimestampImpl(timestamp).format(
        "YYYY-MM-DD"
      );

      expect(returnDate).toEqual("2022-01-28");
    });

    it("渡された時間(ミリ秒)を指定されたフォーマットで値を返す", async () => {
      const timestamp = 1643335656000;

      const returnDate: string = new TimestampImpl(timestamp).format(
        "YYYY-MM-DD"
      );

      expect(returnDate).toEqual("2022-01-28");
    });
  });

  describe("#epochMilliseconds", () => {
    it("渡された時間(秒)をミリ秒で値を返す", async () => {
      const timestamp = 1643335656;

      const returnTime: number = new TimestampImpl(
        timestamp
      ).epochMilliseconds();

      expect(returnTime).toEqual(1643335656000);
    });

    it("渡された時間(ミリ秒)をミリ秒で値を返す", async () => {
      const timestamp = 1643335656000;

      const returnTime: number = new TimestampImpl(
        timestamp
      ).epochMilliseconds();

      expect(returnTime).toEqual(1643335656000);
    });
  });

  describe("#diff", () => {
    it("渡された時間の差分を返す", async () => {
      const oldTimestamp = new TimestampImpl(1643335656000);
      const nowTimestamp = 1643335657000;

      const returnTime: number = new TimestampImpl(nowTimestamp).diff(
        oldTimestamp
      );

      expect(returnTime).toEqual(1000);
    });
  });

  describe("#diffFormat", () => {
    it("渡された時間の差分を「HH:mm:ss」のフォーマットで値を返す", async () => {
      const oldTimestamp = new TimestampImpl(1643335656000);
      const nowTimestamp = 1643335657000;

      const returnTime: string = new TimestampImpl(nowTimestamp).diffFormat(
        oldTimestamp
      );

      expect(returnTime).toEqual("00:00:01");
    });
  });

  describe("#isBetween", () => {
    it("渡された年月日が範囲内かどうか判定する", async () => {
      const start = new TimestampImpl("2022-01-26");
      const end = new TimestampImpl("2022-01-29");
      const now = 1643252856;

      const isBetweenDay: boolean = new TimestampImpl(now).isBetween(
        start,
        end
      );

      expect(isBetweenDay).toBeTruthy();
    });
  });

  describe("#isSameDayAs", () => {
    it("渡された年月日が同日かどうか判定する", async () => {
      const timestamp = 1643311344;
      const now = 1643358144;

      const isSameDay: boolean = new TimestampImpl(now).isSameDayAs(timestamp);

      expect(isSameDay).toBeTruthy();
    });
  });
});
