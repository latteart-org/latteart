/**
 * Copyright 2023 NTT Corporation.
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

import io from "socket.io-client";

interface SocketIOEventListener {
  eventName: string;
  eventHandler: (data?: unknown) => Promise<void>;
}

/**
 * Client for Socket.IO communication.
 */
export class SocketIOClient {
  private socket?: SocketIOClient.Socket;

  /**
   * Constructor.
   * @param serverUrl  Server URL to connect to.
   */
  constructor(public readonly serverUrl: string) {}

  public get isConnected(): boolean {
    return this.socket != null;
  }

  /**
   * Connect with the server.
   * @param onDisConnect  Function to execute when connection is lost.
   * @param eventListeners  A listener that receives events sent by the server during a connection.
   */
  public connect(
    onDisconnect: (error?: Error) => void,
    ...eventListeners: SocketIOEventListener[]
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        reconnectionAttempts: 1,
      });

      this.socket.on("reconnect_failed", () => {
        reject(new Error("Reconnect failed."));
      });

      this.socket.once("connect", () => {
        for (const eventListener of eventListeners) {
          this.socket?.on(eventListener.eventName, async (data?: string) => {
            try {
              await eventListener.eventHandler(data ? JSON.parse(data) : data);
            } catch (error) {
              reject(new Error("Event handle failed."));
            }
          });
        }

        this.socket?.once("disconnect", (reason: string) => {
          const message = `disconnected: ${reason}`;

          if (
            ["ping timeout", "transport close", "transport error"].includes(
              reason
            )
          ) {
            console.error(message);
            this.disconnect();
            onDisconnect(new Error("disconnected"));
          } else {
            console.info(message);
            onDisconnect();
          }
        });

        resolve();
      });

      this.socket.connect();
    });
  }

  /**
   * Disconnect from the server.
   */
  public disconnect(): void {
    if (!this.socket) {
      throw new Error("Not connected.");
    }

    this.socket.disconnect();
  }

  /**
   * Send an event to the connected server.
   * @param eventName  Event name.
   * @param args  Arguments associated with the event.
   */
  public emit(eventName: string, ...args: unknown[]): void {
    if (!this.socket) {
      throw new Error("Not connected.");
    }

    this.socket.emit(eventName, ...args.map((arg) => JSON.stringify(arg)));
  }

  /**
   * Send an event to the connected server and expect a reply asynchronously.
   * When you receive a reply, return the result.
   * @param eventName  Event name.
   * @param replyEventName  Reply event name.
   * @param args  Arguments associated with the event.
   */
  public invoke(
    eventName: string,
    replyEventName: { success: string; failure: string } | string,
    ...args: unknown[]
  ): Promise<{ status: "success" | "failure"; data: unknown }> {
    if (!this.socket) {
      throw new Error("Not connected.");
    }

    const completedEventName =
      typeof replyEventName === "string"
        ? replyEventName
        : replyEventName.success;
    return new Promise<{ status: "success" | "failure"; data: unknown }>(
      (resolve) => {
        this.socket?.once(completedEventName, (data: unknown) => {
          resolve({ status: "success", data });
        });

        if (typeof replyEventName !== "string") {
          this.socket?.once(replyEventName.failure, (data: unknown) => {
            resolve({ status: "failure", data });
          });
        }

        this.socket?.emit(eventName, ...args.map((arg) => JSON.stringify(arg)));
      }
    );
  }
}
