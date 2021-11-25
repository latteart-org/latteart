import { SessionData } from "@/lib/captureControl/SessionData";

describe("SessionDataは", () => {
  describe("startSessionが呼ばれたとき", () => {
    it("新規開始時", () => {
      const sessionData = new SessionData();
      const startTimeStamp = sessionData.startSession(0);

      expect(startTimeStamp).toBeGreaterThan(0);
      expect(startTimeStamp).toEqual(sessionData.getStartTimeStamp());
    });
  });
});
