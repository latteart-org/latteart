/**
 * Copyright 2025 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Browser, CaptureConfig } from "@/CaptureConfig";
import { CDPBrowserOperationCapturer } from "./cdp/CDPBrowserOperationCapturer";
import PuppeteerCDPClient from "./cdp/PuppeteerCDPClient";
import {
  BrowserOperationCapturer,
  BrowserOperationCapturerCallbacks,
} from "./types";
import WebDriverBrowserOperationCapturer from "./webdriver/WebDriverBrowserOperationCapturer";
import WebDriverClientFactory from "@/webdriver/WebDriverClientFactory";
import WebDriverServer from "@/WebDriverServer";
import { ServerConfig } from "@/config/types";
import LoggingService from "@/logger/LoggingService";

export async function createWebDriverBrowserOperationCapturer(
  server: WebDriverServer,
  serverConfig: ServerConfig,
  captureConfig: CaptureConfig,
  callbacks: BrowserOperationCapturerCallbacks
): Promise<BrowserOperationCapturer> {
  const remoteDebuggingPort = serverConfig.remoteDebuggingPort;

  LoggingService.info(
    `WebDriver remote debugging port: ${remoteDebuggingPort}`
  );

  const client = await new WebDriverClientFactory(remoteDebuggingPort).create({
    platformName: captureConfig.platformName,
    browserName: captureConfig.browserName,
    device: captureConfig.device,
    browserBinaryPath: "",
    webDriverServer: server,
    isHeadlessMode: captureConfig.isHeadlessMode,
    captureWindowSize: captureConfig.captureWindowSize,
  });

  return new WebDriverBrowserOperationCapturer(
    client,
    captureConfig,
    callbacks
  );
}

export async function createCDPBrowserOperationCapturer(
  serverConfig: ServerConfig,
  captureConfig: CaptureConfig,
  callbacks: BrowserOperationCapturerCallbacks
): Promise<BrowserOperationCapturer> {
  const defaultChromeExecutablePath = (() => {
    if (process.platform === "win32") {
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }
    if (process.platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    }
    throw new Error("Unsupported platform");
  })();
  const defaultEdgeExecutablePath = (() => {
    if (process.platform === "win32") {
      return "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    }
    if (process.platform === "darwin") {
      return "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
    }
    throw new Error("Unsupported platform");
  })();

  const executablePath = (() => {
    const browserName = captureConfig.browserName;

    LoggingService.info(`Browser for CDP: ${browserName}`);

    if (browserName === Browser.Chrome) {
      return serverConfig.chromeExecutablePath || defaultChromeExecutablePath;
    }
    if (browserName === Browser.Edge) {
      return serverConfig.edgeExecutablePath || defaultEdgeExecutablePath;
    }
    throw new Error("Unsupported browser");
  })();

  LoggingService.info(`CDP executable path: ${executablePath}`);

  const remoteDebuggingPort = serverConfig.remoteDebuggingPort;

  LoggingService.info(`CDP remote debugging port: ${remoteDebuggingPort}`);

  const acceptInsecureCerts = serverConfig.acceptInsecureCerts ?? false;

  LoggingService.info(`CDP accept insecure certs: ${acceptInsecureCerts}`);

  const client = new PuppeteerCDPClient(
    executablePath,
    remoteDebuggingPort,
    acceptInsecureCerts
  );

  return new CDPBrowserOperationCapturer(client, captureConfig, callbacks);
}
