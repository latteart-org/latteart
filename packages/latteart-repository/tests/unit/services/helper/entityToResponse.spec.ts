import { NoteEntity } from "@/entities/NoteEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { testStepEntityToResponse } from "@/services/helper/entityToResponse";

describe("entityToResponse", () => {
  describe("#testStepEntityToResponse", () => {
    it("TestStepEntityをTestStep型へ変換する", () => {
      const note = new NoteEntity();
      note.id = "note1";
      const testStepEntity = new TestStepEntity({
        notes: [note],
        operationElement: "{}",
      });

      const resultOperation = {
        input: testStepEntity.operationInput,
        type: testStepEntity.operationType,
        elementInfo: null,
        title: testStepEntity.pageTitle,
        url: testStepEntity.pageUrl,
        imageFileUrl: testStepEntity.screenshot?.fileUrl ?? "",
        timestamp: testStepEntity.timestamp.toString(),
        inputElements: JSON.parse(testStepEntity.inputElements),
        windowHandle: testStepEntity.windowHandle,
        keywordTexts: JSON.parse(testStepEntity.keywordTexts),
        isAutomatic: !!testStepEntity.isAutomatic,
      };

      const result = testStepEntityToResponse(testStepEntity);
      expect(result).toEqual({
        id: testStepEntity.id,
        operation: resultOperation,
        intention: null,
        bugs: [],
        notices: ["note1"],
      });
    });
  });
});
