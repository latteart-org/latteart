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

import io from "socket.io-client";

interface SocketIOEventListener {
  eventName: string;
  eventHandler: (data?: unknown) => Promise<void>;
}

/**
 * Client for Socket.IO communication.
 */
export class SocketIOClient {
  public existsConnecting = false;
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
    openInfoDialog: (message: string) => void,
    ...eventListeners: SocketIOEventListener[]
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });

      // this.socket.on("reconnect_failed", () => {
      //   reject(new Error("Reconnect failed."));
      // });

      this.socket.on("connect", () => {
        if (this.existsConnecting) {
          console.log(`reconnect: ${this.existsConnecting}`);
          return;
        }

        this.existsConnecting = true;
        console.log("===> connect");
        for (const eventListener of eventListeners) {
          this.socket?.on(eventListener.eventName, async (data?: string) => {
            console.log("eventName", eventListener.eventName);
            console.log(data);
            try {
              await eventListener.eventHandler(data ? JSON.parse(data) : data);
            } catch (error) {
              reject(new Error("Event handle failed."));
            }
          });
        }

        let disconnectReason = "";
        this.socket?.on("connect_error", (reason: string) => {
          console.error(`==> connect_error: ${reason}`);
        });
        this.socket?.on("reconnection_attempt", (reason: string) => {
          console.log(`==> reconnection_attempt: ${reason}`);
        });
        this.socket?.on("reconnect", (reason: string) => {
          console.log(`==> reconnect: ${reason}`);
          openInfoDialog(disconnectReason);

          // onErrorDialog(`reconnect: ${reason}`);
        });
        this.socket?.on("reconnect_error", (reason: string) => {
          console.error(`==> reconnect_error: ${reason}`);
        });

        this.socket?.on("disconnect", (reason: string) => {
          disconnectReason = reason;
          console.info(`==> disconnected: ${reason}`);
          if (reason === "io server disconnect") {
            onDisconnect();
          }
        });

        this.socket?.on("reconnect_failed", (reason: string) => {
          console.error(`==> reconnect_failed: ${reason}`);
          this.existsConnecting = false;
          if (
            ["ping timeout", "transport close", "transport error"].includes(
              reason
            )
          ) {
            console.error(disconnectReason);
            this.disconnect();
            onDisconnect(new Error("disconnect"));
          } else {
            console.info(disconnectReason);
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
    this.existsConnecting = false;
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
