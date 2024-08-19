import { deserializeComments } from "@/services/helper/commentHelper";

describe("deserializeComments", () => {
  const comments = [
    {
      id: "id1",
      testResult: "oldTestResultId",
      value: "value1",
      timestamp: 10,
    },
  ];
  it("idMap有り", () => {
    const commentDatas = [JSON.stringify(comments)];
    const idMap = new Map();
    idMap.set("oldTestResultId", "newTestResultIdMap");

    const result = deserializeComments(commentDatas, "testResultId_1", idMap);

    expect(result[0].testResultId).toEqual("newTestResultIdMap");
  });
  it("idMap無し", () => {
    const commentDatas = [JSON.stringify(comments)];

    const result = deserializeComments(commentDatas, "testResultIdString");

    expect(result[0].testResultId).toEqual("testResultIdString");
  });
});
