import { createRepositoryAccessFailure } from "@/lib/captureControl/Reply";
import { RESTClientResponse } from "@/lib/eventDispatcher/RESTClient";

describe("createRepositoryAccessFailure", () => {
  describe("受け取ったRESTClientResponseを元にRepositoryAccessFailureを生成する", () => {
    it.each([
      { code: "code" },
      { code: "code", message: "message" },
      { code: "code", details: [] },
      {
        code: "code",
        details: [{ code: "code", message: "message", target: "target" }],
      },
      {
        code: "code",
        message: "message",
        details: [{ code: "code", message: "message", target: "target" }],
      },
    ])(
      "受け取ったRESTClientResponseが正しいエラーを持つ場合は、そのエラーを持つRepositoryAccessFailureを生成して返す",
      (data) => {
        const res: RESTClientResponse = { status: 500, data };
        const result = createRepositoryAccessFailure(res);

        expect(result.status).toEqual(res.status);
        expect(result.error).toEqual(res.data);
      }
    );

    it.each([
      undefined,
      {},
      { code: 0 },
      { code: "code", message: 0 },
      { code: "code", details: "" },
      { code: "code", details: [{ code: "code" }] },
    ])(
      "受け取ったRESTClientResponseが不正なエラーを持つ場合は、不明なエラーを持つRepositoryAccessFailureを生成して返す",
      (data) => {
        const res: RESTClientResponse = { status: 500, data };
        const result = createRepositoryAccessFailure(res);

        expect(result.status).toEqual(res.status);
        expect(result.error).toEqual({ code: "unknown_error" });
      }
    );
  });
});
