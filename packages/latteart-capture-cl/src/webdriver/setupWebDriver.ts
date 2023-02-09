/**
 * Copyright 2022 NTT Corporation.
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

import { get } from "http";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Browser, CaptureConfig, PlatformName } from "../CaptureConfig";
import WebDriverServer from "../WebDriverServer";
import LoggingService from "../logger/LoggingService";
import { ServerError } from "../ServerError";
import { AndroidDeviceAccessor } from "../device/AndroidDeviceAccessor";
import { IOSDeviceAccessor } from "../device/IOSDeviceAccessor";

/**
 * Setup WebDriver.
 * @param config config
 * @returns WebDriver server or error
 */
export async function setupWebDriverServer(
  config: Pick<CaptureConfig, "platformName" | "browserName" | "device">
): Promise<
  | {
      error: ServerError;
      server?: undefined;
    }
  | {
      server: WebDriverServer;
      error?: undefined;
    }
> {
  // for mobile
  if (config.platformName !== PlatformName.PC) {
    const appiumUrl = `http://127.0.0.1:4723/wd/hub`;

    if (!(await isServerStarted(appiumUrl))) {
      LoggingService.error("Appium is not ready.");

      const serverError: ServerError = {
        code: "appium_not_started",
        message: "Appium is not started.",
      };

      return { error: serverError };
    }

    if (!(await deviceIsConnected(config.platformName, config.device.id))) {
      const serverError: ServerError = {
        code: "device_not_connected",
        message: "Device is not connected.",
      };

      return { error: serverError };
    }

    return { server: new WebDriverServer(appiumUrl) };
  }

  // for pc
  try {
    LoggingService.info(`Start WebDriver.`);

    const processCall = (() => {
      if (config.browserName === Browser.Edge) {
        return { command: "msedgedriver", port: 9515 };
      }
      return { command: "chromedriver", port: 9515 };
    })();

    const serverUrl = `http://127.0.0.1:${processCall.port}`;

    if (await isServerStarted(serverUrl)) {
      LoggingService.info(`WebDriver has already started.`);

      return { server: new WebDriverServer(serverUrl) };
    }

    const process = await startProcess(processCall.command, async () => {
      return isServerStarted(serverUrl);
    });

    return { server: new WebDriverServer(serverUrl, process) };
  } catch (error) {
    LoggingService.error("WebDriver is not ready.");

    const serverError: ServerError = {
      code: "web_driver_not_ready",
      message: "WebDriver is not ready.",
    };

    return { error: serverError };
  }
}

async function deviceIsConnected(platformName: PlatformName, deviceId: string) {
  const accessor =
    platformName === PlatformName.Android
      ? new AndroidDeviceAccessor()
      : new IOSDeviceAccessor();

  if (!accessor.deviceIsConnected(deviceId)) {
    LoggingService.error(`Device is not connected. : ${deviceId}`);

    return false;
  }

  return true;
}

async function isServerStarted(serverUrl: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const request = get(serverUrl, () => {
      resolve(true);
    });
    request.on("error", () => {
      resolve(false);
    });
  });
}

async function startProcess(
  command: string,
  isProcessStarted: (stdout: string) => Promise<boolean>
) {
  return new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
    const proc = spawn(command);

    proc.on("error", (error) => {
      proc.kill();

      LoggingService.error("Command failed.", error);

      reject(error);
    });

    proc.stdout.on("data", async (data) => {
      const message = data.toString();
      if (await isProcessStarted(message)) {
        LoggingService.info(message);

        resolve(proc);
      }
    });
  });
}
