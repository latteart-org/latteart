import { RESTClientResponse } from "src/common/network/http/client";
import {
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "src/common";

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

        const expectedFailureType = "InternalServerError";
        expect(result.type).toEqual(expectedFailureType);
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

        const expectedFailureType = "InternalServerError";
        expect(result.type).toEqual(expectedFailureType);
        expect(result.error).toEqual({ code: "unknown_error" });
      }
    );

    it.each([
      { status: 404, expectedType: "ResourceNotFound" },
      { status: 403, expectedType: "OtherClientError" },
      { status: 500, expectedType: "InternalServerError" },
      { status: 503, expectedType: "OtherServerError" },
      { status: 999, expectedType: "UnknownError" },
    ])(
      "RepositoryAccessFailureには受け取ったRESTClientResponseのステータスコードに応じた失敗種別を付与する",
      ({ status, expectedType }) => {
        const res: RESTClientResponse = { status, data: { code: "code" } };
        const result = createRepositoryAccessFailure(res);

        const expectedFailureType = expectedType;
        expect(result.type).toEqual(expectedFailureType);
        expect(result.error).toEqual(res.data);
      }
    );
  });
});

describe("createConnectionRefusedFailure", () => {
  it("種別がConnectionRefusedのRepositoryAccessFailureを生成する", () => {
    () => {
      const result = createConnectionRefusedFailure();

      const expectedFailureType = "ConnectionRefused";
      const expectedError = {
        code: "connection_refused",
      };
      expect(result.type).toEqual(expectedFailureType);
      expect(result.error).toEqual(expectedError);
    };
  });
});
