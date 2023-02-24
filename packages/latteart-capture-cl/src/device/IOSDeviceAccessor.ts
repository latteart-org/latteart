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
import { exec } from "child_process";
import encoding from "encoding-japanese";
import DeviceAccessor, { DeviceInfo } from "./DeviceAccessor";

/**
 * Class for accessing iOS devices.
 */
export class IOSDeviceAccessor implements DeviceAccessor {
  private static defaultExecCommand(command: string) {
    return new Promise<string>((resolve, reject) => {
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
    });
  }

  private execCommand: (command: string) => Promise<string>;

  /**
   * Constructor.
   * @param execCommand Function that executes a command to access device.
   */
  constructor(execCommand?: (command: string) => Promise<string>) {
    this.execCommand = execCommand || IOSDeviceAccessor.defaultExecCommand;
  }

  /**
   * @inheritdoc
   */
  public async getDevices(): Promise<DeviceInfo[]> {
    try {
      const deviceIds = (await this.execCommand("idevice_id -l"))
        .split("\n")
        .filter((id) => {
          return id !== "";
        });

      return await Promise.all(
        deviceIds.map<Promise<DeviceInfo>>(async (id) => {
          const name = (
            await this.execCommand(`ideviceinfo -u ${id} -k ModelNumber`)
          ).slice(0, -1);
          const osVersion = (
            await this.execCommand(`ideviceinfo -u ${id} -k ProductVersion`)
          ).slice(0, -1);
          return {
            platform: "iOS",
            id,
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
