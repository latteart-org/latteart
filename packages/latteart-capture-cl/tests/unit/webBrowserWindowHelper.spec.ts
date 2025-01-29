import {
  CapturedOperation,
  isIgnoreOperation,
} from "@/capturer/browser/window/webBrowserWindowHelper";

describe("isIgnoreOperation", () => {
  describe("指定の操作が記録対象外でない場合はfalseを返す", () => {
    describe("単独で発火したイベント", () => {
      it.each`
        eventType   | targetTagname | targetAttributes
        ${"click"}  | ${"INPUT"}    | ${{ type: "text" }}
        ${"click"}  | ${"INPUT"}    | ${{ type: "number" }}
        ${"click"}  | ${"INPUT"}    | ${{ type: "button" }}
        ${"click"}  | ${"INPUT"}    | ${{ type: "radio" }}
        ${"click"}  | ${"INPUT"}    | ${{ type: "checkbox" }}
        ${"click"}  | ${"LABEL"}    | ${{}}
        ${"change"} | ${"INPUT"}    | ${{ type: "text" }}
        ${"change"} | ${"INPUT"}    | ${{ type: "number" }}
        ${"change"} | ${"INPUT"}    | ${{ type: "button" }}
        ${"change"} | ${"INPUT"}    | ${{ type: "date" }}
        ${"change"} | ${"INPUT"}    | ${{ type: "radio" }}
        ${"change"} | ${"INPUT"}    | ${{ type: "checkbox" }}
        ${"change"} | ${"SELECT"}   | ${{}}
        ${"change"} | ${"LABEL"}    | ${{}}
      `(
        "$eventType: $targetTagname $targetAttributes",
        async ({ eventType, targetTagname, targetAttributes }) => {
          const operation: CapturedOperation = {
            type: eventType,
            elementInfo: {
              tagname: targetTagname,
              xpath: "xpath",
              attributes: targetAttributes,
            },
          };

          const result = isIgnoreOperation(operation);

          expect(result).toBeFalsy();
        }
      );
    });

    describe("他のイベントに続けて発火したイベント", () => {
      it.each`
        prevEventType | prevTargetTagname | prevTargetAttributes     | prevTargetXpath | eventType   | targetTagname | targetAttributes                          | targetXpath
        ${"click"}    | ${"INPUT"}        | ${{ type: "radio" }}     | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ type: "radio" }}                      | ${"xpath2"}
        ${"click"}    | ${"INPUT"}        | ${{ type: "checkbox" }}  | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ type: "checkbox" }}                   | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "textId" }}     | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ id: "textId", type: "text" }}         | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "passwordId" }} | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ id: "passwordId", type: "password" }} | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "emailId" }}    | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ id: "emailId", type: "email" }}       | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "telId" }}      | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ id: "telId", type: "tel" }}           | ${"xpath2"}
      `(
        "$prevEventType: $prevTargetTagname $prevTargetAttributes $prevTargetXpath => $eventType: $targetTagname $targetAttributes $targetXpath",
        async ({
          prevEventType,
          prevTargetTagname,
          prevTargetAttributes,
          prevTargetXpath,
          eventType,
          targetTagname,
          targetAttributes,
          targetXpath,
        }) => {
          const prevOperations = [
            {
              type: prevEventType,
              elementInfo: {
                tagname: prevTargetTagname,
                xpath: prevTargetXpath,
                attributes: prevTargetAttributes,
              },
            },
          ];

          const operation = {
            type: eventType,
            elementInfo: {
              tagname: targetTagname,
              xpath: targetXpath,
              attributes: targetAttributes,
            },
          };

          const result = isIgnoreOperation(operation, prevOperations);

          expect(result).toBeFalsy();
        }
      );
    });
  });

  describe("指定の操作が記録対象外の場合はtrueを返す", () => {
    describe("単独で発火したイベント", () => {
      it.each`
        eventType  | targetTagname | targetAttributes
        ${"click"} | ${"INPUT"}    | ${{ type: "date" }}
        ${"click"} | ${"SELECT"}   | ${{}}
      `(
        "$eventType: $targetTagname $targetAttributes",
        async ({ eventType, targetTagname, targetAttributes }) => {
          const operation: CapturedOperation = {
            type: eventType,
            elementInfo: {
              tagname: targetTagname,
              xpath: "xpath",
              attributes: targetAttributes,
            },
          };

          const result = isIgnoreOperation(operation);

          expect(result).toBeTruthy();
        }
      );
    });

    describe("他のイベントに続けて発火したイベント", () => {
      it.each`
        prevEventType | prevTargetTagname | prevTargetAttributes     | prevTargetXpath | eventType   | targetTagname | targetAttributes                          | targetXpath
        ${"click"}    | ${"INPUT"}        | ${{ type: "radio" }}     | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ type: "radio" }}                      | ${"xpath1"}
        ${"click"}    | ${"INPUT"}        | ${{ type: "checkbox" }}  | ${"xpath1"}     | ${"change"} | ${"INPUT"}    | ${{ type: "checkbox" }}                   | ${"xpath1"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "checkboxId" }} | ${"xpath1"}     | ${"click"}  | ${"INPUT"}    | ${{ id: "checkboxId", type: "checkbox" }} | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "radioId" }}    | ${"xpath1"}     | ${"click"}  | ${"INPUT"}    | ${{ id: "radioId", type: "radio" }}       | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "textId" }}     | ${"xpath1"}     | ${"click"}  | ${"INPUT"}    | ${{ id: "textId", type: "text" }}         | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "passwordId" }} | ${"xpath1"}     | ${"click"}  | ${"INPUT"}    | ${{ id: "passwordId", type: "password" }} | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "emailId" }}    | ${"xpath1"}     | ${"click"}  | ${"INPUT"}    | ${{ id: "emailId", type: "email" }}       | ${"xpath2"}
        ${"click"}    | ${"LABEL"}        | ${{ for: "telId" }}      | ${"xpath1"}     | ${"click"}  | ${"INPUT"}    | ${{ id: "telId", type: "tel" }}           | ${"xpath2"}
      `(
        "$prevEventType: $prevTargetTagname $prevTargetAttributes $prevTargetXpath => $eventType: $targetTagname $targetAttributes $targetXpath",
        async ({
          prevEventType,
          prevTargetTagname,
          prevTargetAttributes,
          prevTargetXpath,
          eventType,
          targetTagname,
          targetAttributes,
          targetXpath,
        }) => {
          const prevOperations = [
            {
              type: prevEventType,
              elementInfo: {
                tagname: prevTargetTagname,
                xpath: prevTargetXpath,
                attributes: prevTargetAttributes,
              },
            },
          ];

          const operation = {
            type: eventType,
            elementInfo: {
              tagname: targetTagname,
              xpath: targetXpath,
              attributes: targetAttributes,
            },
          };

          const result = isIgnoreOperation(operation, prevOperations);

          expect(result).toBeTruthy();
        }
      );
    });
  });
});
