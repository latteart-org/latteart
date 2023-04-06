jest.mock("@/capturer/captureScript");

import WebBrowserWindow from "@/capturer/browser/window/WebBrowserWindow";
import { CapturedData, captureScript } from "@/capturer/captureScript";
import WebDriverClient from "@/webdriver/WebDriverClient";

describe("WebBrowserWindow", () => {
  let clientMock: WebDriverClient;

  beforeEach(() => {
    clientMock = {
      open: jest.fn(),
      setTimeouts: jest.fn(),
      sleep: jest.fn(),
      refresh: jest.fn(),
      close: jest.fn(),
      getAllWindowHandles: jest.fn(),
      switchWindowTo: jest.fn(),
      alertIsVisible: jest.fn(),
      getCurrentUrl: jest.fn(),
      getCurrentWindowHandle: jest.fn(),
      getCurrentTitle: jest.fn(),
      takeScreenshot: jest.fn(),
      browserBack: jest.fn(),
      browserForward: jest.fn(),
      getCurrentPageSource: jest.fn(),
      getCurrentPageText: jest.fn(),
      clickElement: jest.fn(),
      clearAndSendKeysToElement: jest.fn(),
      sendKeys: jest.fn(),
      acceptAlert: jest.fn(),
      dismissAlert: jest.fn(),
      getDocumentReadyState: jest.fn(),
      selectOption: jest.fn(),
      selectOptionUsingWebElement: jest.fn(),
      getElementByXpath: jest.fn(),
      getElementsByXpath: jest.fn(),
      getElementByTagName: jest.fn(),
      execute: jest
        .fn()
        .mockImplementation(async (script, args) => script(args)),
      getClientSize: jest.fn(),
    };
  });

  describe("#getScreenshot", () => {
    it("WebDriver経由でスクリーンショットを取得する", async () => {
      clientMock.takeScreenshot = jest.fn().mockResolvedValue("screenshot");

      const window = new WebBrowserWindow("", clientMock, "");

      expect(await window.getScreenshot()).toEqual("screenshot");
    });
  });

  describe("#getReadyToCapture", () => {
    it("記録対象画面に操作記録用のコードが埋め込まれていない場合は埋め込む", async () => {
      (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(false);
      (
        captureScript.setFunctionToGetAttributesFromElement as jest.Mock
      ).mockReturnValue(true);
      (
        captureScript.setFunctionToCollectVisibleElements as jest.Mock
      ).mockReturnValue(true);
      (captureScript.setFunctionToExtractElements as jest.Mock).mockReturnValue(
        true
      );
      (
        captureScript.setFunctionToEnqueueEventForReFire as jest.Mock
      ).mockReturnValue(true);
      (
        captureScript.setFunctionToBuildOperationInfo as jest.Mock
      ).mockReturnValue(true);
      (
        captureScript.setFunctionToHandleCapturedEvent as jest.Mock
      ).mockReturnValue(true);
      (captureScript.resetEventListeners as jest.Mock).mockReturnValue(true);
      (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([]);

      const window = new WebBrowserWindow("", clientMock, "");

      await window.getReadyToCapture();

      expect(captureScript.setFunctionToGetAttributesFromElement).toBeCalled();
      expect(captureScript.setFunctionToCollectVisibleElements).toBeCalled();
      expect(captureScript.setFunctionToExtractElements).toBeCalled();
      expect(captureScript.setFunctionToEnqueueEventForReFire).toBeCalled();
      expect(captureScript.setFunctionToBuildOperationInfo).toBeCalled();
      expect(captureScript.setFunctionToHandleCapturedEvent).toBeCalled();
      expect(captureScript.resetEventListeners).toBeCalled();
    });
  });

  describe("#captureOperations", () => {
    const op = {
      input: "input",
      title: "title",
      url: "url",
      scrollPosition: { x: 0, y: 0 },
    } as const;
    const ev = {
      id: "eventId",
      option: { bubbles: false, cancelable: false },
    } as const;

    describe("記録対象画面上で発火したイベントを取得し、操作情報として記録する", () => {
      describe("記録対象のイベントは操作として記録する", () => {
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
              clientMock.takeScreenshot = jest
                .fn()
                .mockResolvedValue("screenshot");
              clientMock.getClientSize = jest
                .fn()
                .mockResolvedValue({ width: 0, height: 0 });
              (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(
                true
              );

              const elements: CapturedData["operation"]["elementInfo"][] = [
                {
                  tagname: targetTagname,
                  text: "text",
                  xpath: "xpath",
                  attributes: targetAttributes,
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                },
              ];
              (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
                {
                  operation: {
                    ...op,
                    type: eventType,
                    elementInfo: elements[0],
                  },
                  eventInfo: {
                    ...ev,
                    type: eventType,
                    targetXPath: elements[0].xpath,
                  },
                  elements,
                },
              ]);

              const option = { onGetOperation: jest.fn() };
              const window = new WebBrowserWindow("", clientMock, "", option);

              await window.captureOperations();

              expect(option.onGetOperation).toBeCalledTimes(1);
              expect(option.onGetOperation).toBeCalledWith({
                type: eventType,
                elementInfo: {
                  tagname: targetTagname,
                  text: "text",
                  xpath: "xpath",
                  attributes: targetAttributes,
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                },
                input: expect.any(String),
                title: expect.any(String),
                url: expect.any(String),
                imageData: expect.any(String),
                windowHandle: expect.any(String),
                timestamp: expect.any(String),
                screenElements: expect.any(Array),
                pageSource: expect.any(String),
                inputElements: expect.any(Array),
                scrollPosition: { x: 0, y: 0 },
                clientSize: { width: 0, height: 0 },
              });
            }
          );
        });

        describe("他のイベントに続けて発火したイベント", () => {
          it.each`
            eventType1 | targetTagname1 | targetAttributes1       | targetXpath1 | eventType2  | targetTagname2 | targetAttributes2       | targetXpath2
            ${"click"} | ${"INPUT"}     | ${{ type: "radio" }}    | ${"xpath1"}  | ${"change"} | ${"INPUT"}     | ${{ type: "radio" }}    | ${"xpath2"}
            ${"click"} | ${"INPUT"}     | ${{ type: "checkbox" }} | ${"xpath1"}  | ${"change"} | ${"INPUT"}     | ${{ type: "checkbox" }} | ${"xpath2"}
          `(
            "$eventType1: $targetTagname1 $targetAttributes1 $targetXpath1 => $eventType2: $targetTagname2 $targetAttributes2 $targetXpath2",
            async ({
              eventType1,
              targetTagname1,
              targetAttributes1,
              targetXpath1,
              eventType2,
              targetTagname2,
              targetAttributes2,
              targetXpath2,
            }) => {
              clientMock.takeScreenshot = jest
                .fn()
                .mockResolvedValue("screenshot");
              clientMock.getClientSize = jest
                .fn()
                .mockResolvedValue({ width: 0, height: 0 });
              (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(
                true
              );
              const e1 = {
                tagname: targetTagname1,
                text: "text",
                xpath: targetXpath1,
                attributes: targetAttributes1,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              };
              const e2 = {
                tagname: targetTagname2,
                text: "text",
                xpath: targetXpath2,
                attributes: targetAttributes2,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              };
              const elements: CapturedData["operation"]["elementInfo"][] =
                e1.xpath === e2.xpath ? [e1] : [e1, e2];
              (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
                {
                  operation: { ...op, type: eventType1, elementInfo: e1 },
                  eventInfo: { ...ev, type: eventType1, targetXPath: e1.xpath },
                  elements,
                },
                {
                  operation: { ...op, type: eventType2, elementInfo: e2 },
                  eventInfo: { ...ev, type: eventType2, targetXPath: e2.xpath },
                  elements,
                },
              ]);

              const option = { onGetOperation: jest.fn() };
              const window = new WebBrowserWindow("", clientMock, "", option);

              await window.captureOperations();

              expect(option.onGetOperation).toBeCalledTimes(2);
              expect(option.onGetOperation).toBeCalledWith({
                type: eventType1,
                elementInfo: {
                  tagname: targetTagname1,
                  text: "text",
                  xpath: targetXpath1,
                  attributes: targetAttributes1,
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                },
                input: expect.any(String),
                title: expect.any(String),
                url: expect.any(String),
                imageData: expect.any(String),
                windowHandle: expect.any(String),
                timestamp: expect.any(String),
                screenElements: expect.any(Array),
                pageSource: expect.any(String),
                inputElements: expect.any(Array),
                scrollPosition: { x: 0, y: 0 },
                clientSize: { width: 0, height: 0 },
              });
              expect(option.onGetOperation).toBeCalledWith({
                type: eventType2,
                elementInfo: {
                  tagname: targetTagname2,
                  text: "text",
                  xpath: targetXpath2,
                  attributes: targetAttributes2,
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                },
                input: expect.any(String),
                title: expect.any(String),
                url: expect.any(String),
                imageData: expect.any(String),
                windowHandle: expect.any(String),
                timestamp: expect.any(String),
                screenElements: expect.any(Array),
                pageSource: expect.any(String),
                inputElements: expect.any(Array),
                scrollPosition: { x: 0, y: 0 },
                clientSize: { width: 0, height: 0 },
              });
            }
          );
        });
      });

      describe("記録対象外のイベントは操作として記録しない", () => {
        describe("単独で発火したイベント", () => {
          it.each`
            eventType  | targetTagname | targetAttributes
            ${"click"} | ${"INPUT"}    | ${{ type: "date" }}
            ${"click"} | ${"SELECT"}   | ${{}}
          `(
            "$eventType: $targetTagname $targetAttributes",
            async ({ eventType, targetTagname, targetAttributes }) => {
              clientMock.takeScreenshot = jest
                .fn()
                .mockResolvedValue("screenshot");
              clientMock.getClientSize = jest
                .fn()
                .mockResolvedValue({ width: 0, height: 0 });
              (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(
                true
              );
              const elements: CapturedData["operation"]["elementInfo"][] = [
                {
                  tagname: targetTagname,
                  text: "text",
                  xpath: "xpath",
                  attributes: targetAttributes,
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                },
              ];
              (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
                {
                  operation: {
                    ...op,
                    type: eventType,
                    elementInfo: elements[0],
                  },
                  eventInfo: {
                    ...ev,
                    type: eventType,
                    targetXPath: elements[0].xpath,
                  },
                  elements,
                },
              ]);

              const option = { onGetOperation: jest.fn() };
              const window = new WebBrowserWindow("", clientMock, "", option);

              await window.captureOperations();

              expect(option.onGetOperation).not.toBeCalled();
            }
          );
        });

        describe("他のイベントに続けて発火したイベント", () => {
          it.each`
            eventType1 | targetTagname1 | targetAttributes1        | targetXpath1 | eventType2  | targetTagname2 | targetAttributes2                         | targetXpath2
            ${"click"} | ${"INPUT"}     | ${{ type: "radio" }}     | ${"xpath1"}  | ${"change"} | ${"INPUT"}     | ${{ type: "radio" }}                      | ${"xpath1"}
            ${"click"} | ${"INPUT"}     | ${{ type: "checkbox" }}  | ${"xpath1"}  | ${"change"} | ${"INPUT"}     | ${{ type: "checkbox" }}                   | ${"xpath1"}
            ${"click"} | ${"LABEL"}     | ${{ for: "checkboxId" }} | ${"xpath1"}  | ${"click"}  | ${"INPUT"}     | ${{ id: "checkboxId", type: "checkbox" }} | ${"xpath2"}
          `(
            "$eventType1: $targetTagname1 $targetAttributes1 $targetXpath1 => $eventType2: $targetTagname2 $targetAttributes2 $targetXpath2",
            async ({
              eventType1,
              targetTagname1,
              targetAttributes1,
              targetXpath1,
              eventType2,
              targetTagname2,
              targetAttributes2,
              targetXpath2,
            }) => {
              clientMock.takeScreenshot = jest
                .fn()
                .mockResolvedValue("screenshot");
              clientMock.getClientSize = jest
                .fn()
                .mockResolvedValue({ width: 0, height: 0 });
              (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(
                true
              );
              const e1 = {
                tagname: targetTagname1,
                text: "text",
                xpath: targetXpath1,
                attributes: targetAttributes1,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              };
              const e2 = {
                tagname: targetTagname2,
                text: "text",
                xpath: targetXpath2,
                attributes: targetAttributes2,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              };
              const elements: CapturedData["operation"]["elementInfo"][] =
                e1.xpath === e2.xpath ? [e1] : [e1, e2];
              (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
                {
                  operation: { ...op, type: eventType1, elementInfo: e1 },
                  eventInfo: { ...ev, type: eventType1, targetXPath: e1.xpath },
                  elements,
                },
                {
                  operation: { ...op, type: eventType2, elementInfo: e2 },
                  eventInfo: { ...ev, type: eventType2, targetXPath: e2.xpath },
                  elements,
                },
              ]);

              const option = { onGetOperation: jest.fn() };
              const window = new WebBrowserWindow("", clientMock, "", option);

              await window.captureOperations();

              expect(option.onGetOperation).toBeCalledTimes(1);
              expect(option.onGetOperation).toBeCalledWith({
                type: eventType1,
                elementInfo: {
                  tagname: targetTagname1,
                  text: "text",
                  xpath: targetXpath1,
                  attributes: targetAttributes1,
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                },
                input: expect.any(String),
                title: expect.any(String),
                url: expect.any(String),
                imageData: expect.any(String),
                windowHandle: expect.any(String),
                timestamp: expect.any(String),
                screenElements: expect.any(Array),
                pageSource: expect.any(String),
                inputElements: expect.any(Array),
                scrollPosition: { x: 0, y: 0 },
                clientSize: { width: 0, height: 0 },
              });
            }
          );
        });
      });

      describe("アラートが画面に表示されている場合は取得したイベントを操作として記録しない", () => {
        it.each`
          eventType  | targetTagname | targetAttributes
          ${"click"} | ${"INPUT"}    | ${{ type: "text" }}
        `(
          "$eventType: $targetTagname $targetAttributes",
          async ({ eventType, targetTagname, targetAttributes }) => {
            clientMock.takeScreenshot = jest
              .fn()
              .mockResolvedValue("screenshot");
            clientMock.getClientSize = jest
              .fn()
              .mockResolvedValue({ width: 0, height: 0 });
            clientMock.alertIsVisible = jest.fn().mockResolvedValue(true);
            (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(true);
            const elements: CapturedData["operation"]["elementInfo"][] = [
              {
                tagname: targetTagname,
                text: "text",
                xpath: "xpath",
                attributes: targetAttributes,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              },
            ];
            (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
              {
                operation: {
                  ...op,
                  type: eventType,
                  elementInfo: elements[0],
                },
                eventInfo: {
                  ...ev,
                  type: eventType,
                  targetXPath: elements[0].xpath,
                },
                elements,
              },
            ]);

            const option = { onGetOperation: jest.fn() };
            const window = new WebBrowserWindow("", clientMock, "", option);

            await window.captureOperations();

            expect(option.onGetOperation).not.toBeCalled();
          }
        );
      });
    });

    describe("記録対象画面上で発火したイベントの伝播を止め、記録完了後に止めたイベントを再発火する", () => {
      describe("再発火できない一部のイベントについては、WebDriver経由でキーボード入力を行うことで代替する", () => {
        it.each`
          eventType  | targetTagname | targetAttributes    | keyCode     | keyName
          ${"click"} | ${"INPUT"}    | ${{ type: "date" }} | ${"\ue00D"} | ${"space"}
        `(
          "$eventType: $targetTagname $targetAttributes => $keyName",
          async ({ eventType, targetTagname, targetAttributes, keyCode }) => {
            clientMock.takeScreenshot = jest
              .fn()
              .mockResolvedValue("screenshot");
            clientMock.getClientSize = jest
              .fn()
              .mockResolvedValue({ width: 0, height: 0 });
            (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(true);
            const elements: CapturedData["operation"]["elementInfo"][] = [
              {
                tagname: targetTagname,
                text: "text",
                xpath: "xpath",
                attributes: targetAttributes,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              },
            ];
            (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
              {
                operation: {
                  ...op,
                  type: eventType,
                  elementInfo: elements[0],
                },
                eventInfo: {
                  ...ev,
                  type: eventType,
                  targetXPath: elements[0].xpath,
                },
                elements,
              },
            ]);

            const option = { onGetOperation: jest.fn() };
            const window = new WebBrowserWindow("", clientMock, "", option);

            await window.captureOperations();

            expect(clientMock.sendKeys).toBeCalledTimes(1);
            expect(clientMock.sendKeys).toBeCalledWith("xpath", keyCode);
          }
        );
      });

      describe("アラートが画面に表示されている場合は取得した操作を再発火しない", () => {
        it.each`
          eventType  | targetTagname | targetAttributes
          ${"click"} | ${"INPUT"}    | ${{ type: "text" }}
          ${"click"} | ${"INPUT"}    | ${{ type: "date" }}
        `(
          "$eventType: $targetTagname $targetAttributes",
          async ({ eventType, targetTagname, targetAttributes }) => {
            clientMock.takeScreenshot = jest
              .fn()
              .mockResolvedValue("screenshot");
            clientMock.getClientSize = jest
              .fn()
              .mockResolvedValue({ width: 0, height: 0 });
            clientMock.alertIsVisible = jest.fn().mockResolvedValue(true);
            (captureScript.isReadyToCapture as jest.Mock).mockReturnValue(true);
            const elements: CapturedData["operation"]["elementInfo"][] = [
              {
                tagname: targetTagname,
                text: "text",
                xpath: "xpath",
                attributes: targetAttributes,
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
              },
            ];
            (captureScript.pullCapturedDatas as jest.Mock).mockReturnValue([
              {
                operation: {
                  ...op,
                  type: eventType,
                  elementInfo: elements[0],
                },
                eventInfo: {
                  ...ev,
                  type: eventType,
                  targetXPath: elements[0].xpath,
                },
                elements,
              },
            ]);

            const option = { onGetOperation: jest.fn() };
            const window = new WebBrowserWindow("", clientMock, "", option);

            await window.captureOperations();

            expect(captureScript.refireEvent).not.toBeCalled();
            expect(clientMock.sendKeys).not.toBeCalled();
          }
        );
      });
    });
  });

  describe("#captureScreenTransition", () => {
    describe("記録対象画面が遷移した場合は画面遷移情報と遷移履歴情報を記録する", () => {
      it("記録対象画面がロードされた時", async () => {
        clientMock.takeScreenshot = jest.fn().mockResolvedValue("screenshot");
        clientMock.getClientSize = jest
          .fn()
          .mockResolvedValue({ width: 0, height: 0 });
        clientMock.getCurrentTitle = jest.fn().mockResolvedValue("title");
        clientMock.getCurrentPageText = jest.fn().mockResolvedValue("pageText");
        clientMock.getDocumentReadyState = jest
          .fn()
          .mockResolvedValue("complete");
        clientMock.getCurrentUrl = jest
          .fn()
          .mockResolvedValue("http://127.0.0.1/page1");
        (captureScript.isCurrentScreenObserved as jest.Mock).mockReturnValue(
          false
        );

        const option = {
          onGetScreenTransition: jest.fn(),
          onHistoryChanged: jest.fn(),
        };
        const window = new WebBrowserWindow(
          "",
          clientMock,
          "windowHandle",
          option
        );

        await window.captureScreenTransition();

        expect(option.onGetScreenTransition).toBeCalledTimes(1);
        expect(option.onGetScreenTransition).toBeCalledWith({
          windowHandle: "windowHandle",
          title: "title",
          url: "http://127.0.0.1/page1",
          imageData: "screenshot",
          pageSource: "pageText",
          timestamp: expect.any(String),
          scrollPosition: { x: 0, y: 0 },
          clientSize: { width: 0, height: 0 },
          screenElements: [],
        });
        expect(option.onHistoryChanged).toBeCalledTimes(1);
        expect(option.onHistoryChanged).toBeCalledWith({
          canGoBack: false,
          canGoForward: false,
        });
      });

      it("記録対象画面のURLが動的に変わった時", async () => {
        clientMock.takeScreenshot = jest.fn().mockResolvedValue("screenshot");

        clientMock.getClientSize = jest
          .fn()
          .mockResolvedValue({ width: 0, height: 0 });
        clientMock.getCurrentTitle = jest.fn().mockResolvedValue("title");
        clientMock.getCurrentPageText = jest.fn().mockResolvedValue("pageText");
        clientMock.getDocumentReadyState = jest
          .fn()
          .mockResolvedValue("complete");
        clientMock.getCurrentUrl = jest
          .fn()
          // 実装の都合上1画面毎に2回ずつ呼ばれるが、本来は1回ずつにできるはず
          .mockResolvedValueOnce("http://127.0.0.1/page1")
          .mockResolvedValueOnce("http://127.0.0.1/page1")
          .mockResolvedValueOnce("http://127.0.0.1/page2")
          .mockResolvedValueOnce("http://127.0.0.1/page2");
        (captureScript.isCurrentScreenObserved as jest.Mock)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true);

        const option = {
          onGetScreenTransition: jest.fn(),
          onHistoryChanged: jest.fn(),
        };
        const window = new WebBrowserWindow(
          "",
          clientMock,
          "windowHandle",
          option
        );

        await window.captureScreenTransition();

        expect(option.onGetScreenTransition).toBeCalledTimes(1);
        expect(option.onGetScreenTransition).toBeCalledWith({
          windowHandle: "windowHandle",
          title: "title",
          url: "http://127.0.0.1/page1",
          imageData: "screenshot",
          pageSource: "pageText",
          timestamp: expect.any(String),
          scrollPosition: { x: 0, y: 0 },
          clientSize: { width: 0, height: 0 },
          screenElements: [],
        });
        expect(option.onHistoryChanged).toBeCalledTimes(1);
        expect(option.onHistoryChanged).toBeCalledWith({
          canGoBack: false,
          canGoForward: false,
        });

        await window.captureScreenTransition();

        expect(option.onGetScreenTransition).toBeCalledTimes(2);
        expect(option.onGetScreenTransition).toBeCalledWith({
          windowHandle: "windowHandle",
          title: "title",
          url: "http://127.0.0.1/page2",
          imageData: "screenshot",
          pageSource: "pageText",
          timestamp: expect.any(String),
          scrollPosition: { x: 0, y: 0 },
          clientSize: { width: 0, height: 0 },
          screenElements: [],
        });
        expect(option.onHistoryChanged).toBeCalledTimes(2);
        expect(option.onHistoryChanged).toBeCalledWith({
          canGoBack: true,
          canGoForward: false,
        });
      });
    });

    describe("記録対象画面がロード中の場合は何もしない", () => {
      it.each`
        documentReadyState
        ${"loading"}
        ${"interactive"}
      `("$documentReadyState", async ({ documentReadyState }) => {
        clientMock.takeScreenshot = jest.fn().mockResolvedValue("screenshot");
        clientMock.getCurrentTitle = jest.fn().mockResolvedValue("title");
        clientMock.getCurrentPageText = jest.fn().mockResolvedValue("pageText");
        clientMock.getDocumentReadyState = jest
          .fn()
          .mockResolvedValue(documentReadyState);
        clientMock.getCurrentUrl = jest
          .fn()
          .mockResolvedValue("http://127.0.0.1/page1");
        (captureScript.isCurrentScreenObserved as jest.Mock).mockReturnValue(
          false
        );

        const option = {
          onGetScreenTransition: jest.fn(),
          onHistoryChanged: jest.fn(),
        };
        const window = new WebBrowserWindow(
          "",
          clientMock,
          "windowHandle",
          option
        );

        await window.captureScreenTransition();

        expect(option.onGetScreenTransition).not.toBeCalled();
        expect(option.onHistoryChanged).not.toBeCalled();
      });
    });

    it("記録対象画面のURLが取得できない場合は何もしない", async () => {
      clientMock.takeScreenshot = jest.fn().mockResolvedValue("screenshot");
      clientMock.getCurrentTitle = jest.fn().mockResolvedValue("title");
      clientMock.getCurrentPageText = jest.fn().mockResolvedValue("pageText");
      clientMock.getDocumentReadyState = jest
        .fn()
        .mockResolvedValue("complete");
      clientMock.getCurrentUrl = jest.fn().mockResolvedValue("");
      (captureScript.isCurrentScreenObserved as jest.Mock).mockReturnValue(
        false
      );

      const option = {
        onGetScreenTransition: jest.fn(),
        onHistoryChanged: jest.fn(),
      };
      const window = new WebBrowserWindow(
        "",
        clientMock,
        "windowHandle",
        option
      );

      await window.captureScreenTransition();

      expect(option.onGetScreenTransition).not.toBeCalled();
      expect(option.onHistoryChanged).not.toBeCalled();
    });
  });
});
