import {
  deserializeMutations,
  ExportMutationData,
} from "@/services/helper/mutationHelper";

describe("deserializeMutations", () => {
  describe("mutationをdeserializeする", () => {
    const mutations: ExportMutationData[] = [
      {
        id: "id1",
        testResult: "oldTestResultId",
        elementMutations: "[]",
        timestamp: 10,
        screenshot: "xxx.png",
        windowHandle: "windowHandleId",
        scrollPositionX: 1,
        scrollPositionY: 2,
        clientSizeHeight: 10,
        clientSizeWidth: 20,
        url: "http://localhost",
        title: "title",
      },
    ];
    it("idMap有り", () => {
      const mutationDatas = [JSON.stringify(mutations)];
      const idMap = new Map();
      idMap.set("oldTestResultId", "newTestResultIdMap");

      const result = deserializeMutations(
        mutationDatas,
        "testResultId_1",
        idMap
      );

      expect(result[0].testResultId).toEqual("newTestResultIdMap");
    });
    it("idMap無し", () => {
      const mutationDatas = [JSON.stringify(mutations)];

      const result = deserializeMutations(mutationDatas, "testResultIdString");

      expect(result[0].testResultId).toEqual("testResultIdString");
    });
  });
});
