import { NoteEntity } from "@/entities/NoteEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { convertTestStepEntityToResponse } from "@/services/helper/entityToResponse";

describe("entityToResponse", () => {
  describe("#convertTestStepEntityToResponse", () => {
    it("TestStepEntityをTestStep型へ変換する", () => {
      const note = new NoteEntity();
      note.id = "note1";
      const testStepEntity = new TestStepEntity({
        notes: [note],
      });

      const resultOperation = {
        input: testStepEntity.operationInput,
        type: testStepEntity.operationType,
        elementInfo: JSON.parse(testStepEntity.operationElement),
        title: testStepEntity.pageTitle,
        url: testStepEntity.pageUrl,
        imageFileUrl: testStepEntity.screenshot?.fileUrl ?? "",
        timestamp: testStepEntity.timestamp.toString(),
        inputElements: JSON.parse(testStepEntity.inputElements),
        windowHandle: testStepEntity.windowHandle,
        keywordTexts: JSON.parse(testStepEntity.keywordTexts),
        isAutomatic: !!testStepEntity.isAutomatic,
      };

      const result = convertTestStepEntityToResponse(testStepEntity);
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
