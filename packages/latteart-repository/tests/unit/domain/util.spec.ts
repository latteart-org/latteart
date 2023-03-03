import { executeExternalCommand } from "@/gateways/settings/util";

describe("util.", () => {
  describe("executeExternalCommand", () => {
    describe("Execute an external command", () => {
      it("normal", async () => {
        const command = "echo aaa";
        await executeExternalCommand(command);
      });
      it("error", async () => {
        const command = "echozzzzzzzz";
        await expect(executeExternalCommand(command)).rejects.toThrowError();
      });
    });
  });
});
