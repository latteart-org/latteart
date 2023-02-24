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

import LoggingService from "../logger/LoggingService";
import { exec, spawn } from "child_process";
import encoding from "encoding-japanese";
import DeviceAccessor, { DeviceInfo } from "./DeviceAccessor";

/**
 * The class for accessing Android devices.
 */
export class AndroidDeviceAccessor implements DeviceAccessor {
  private static async defaultExecCommand(command: string) {
    return new Promise<string>((resolve, reject) => {
      const execute = () => {
        exec(command, { encoding: "buffer" }, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          }

          if (stderr && stderr.length > 0) {
            LoggingService.warn(
              String.fromCharCode(...encoding.convert(stderr, "UNICODE"))
            );
          }

          resolve(String.fromCharCode(...encoding.convert(stdout, "UNICODE")));
        });
      };

      const process = spawn("adb", ["start-server"]);

      process.on("error", (error) => {
        process.kill();

        reject(error);
      });

      process.stderr.on("data", (data) => {
        if (data.toString().includes("daemon started successfully")) {
          LoggingService.info("ADB server started successfully.");
          process.kill();

          execute();
        }
      });

      process.on("close", () => {
        LoggingService.info("ADB server has already started.");
        process.kill();

        execute();
      });
    });
  }

  private execCommand: (command: string) => Promise<string>;

  /**
   * Constructor.
   * @param execCommand Function that executes a command to access a device.
   */
  constructor(execCommand?: (command: string) => Promise<string>) {
    this.execCommand = execCommand || AndroidDeviceAccessor.defaultExecCommand;
  }

  /**
   * @inheritdoc
   */
  public async getDevices(): Promise<DeviceInfo[]> {
    try {
      const deviceIds = (await this.execCommand("adb devices"))
        .split("\n")
        .filter((deviceLine, index) => {
          return index !== 0;
        })
        .map((adbDevicesLine) => {
          const ids = adbDevicesLine.match(/\S+/g);
          return ids !== null ? ids[0] : "";
        })
        .filter((deviceName) => {
          return deviceName !== "";
        });

      return await Promise.all(
        deviceIds.map<Promise<DeviceInfo>>(async (id) => {
          const name = await this.execCommand(
            `adb -s ${id} shell getprop ro.product.model`
          );
          const osVersion = await this.execCommand(
            `adb -s ${id} shell getprop ro.build.version.release`
          );
          return {
            platform: "Android",
            id: id!,
            name,
            osVersion,
          };
        })
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * @inheritdoc
   */
  public async deviceIsConnected(deviceId: string): Promise<boolean> {
    return (
      (await this.getDevices()).find((device) => {
        return device.id === deviceId;
      }) !== undefined
    );
  }
}
