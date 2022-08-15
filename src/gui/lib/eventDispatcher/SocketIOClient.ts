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

/**
 * Client for Socket.IO communication.
 */
export default class SocketIOClient {
  private socket: SocketIOClient.Socket;

  /**
   * Constructor.
   * @param serverUrl  Server URL to connect to.
   */
  constructor(serverUrl: string) {
    this.socket = io(serverUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 1,
    });
  }

  /**
   * Connect with the server.
   * @param onConnect  Function to execute when a connection is established.
   * @param eventListeners  A listener that receives events sent by the server during a connection.
   */
  public connect(
    onConnect: () => void,
    ...eventListeners: SocketIOEventListener[]
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.socket.on("reconnect_failed", () => {
        reject(new Error("reconnect failed"));
      });

      this.socket.once("connect", () => {
        for (const eventListener of eventListeners) {
          this.socket.on(eventListener.eventName, (data?: string) => {
            console.log(`receive: ${eventListener.eventName}`);
            console.log(data);
            eventListener.eventHandler(data ? JSON.parse(data) : data);
          });
        }

        this.socket.once("disconnect", (reason: string) => {
          const message = `disconnected: ${reason}`;

          if (
            ["ping timeout", "transport close", "transport error"].includes(
              reason
            )
          ) {
            console.error(message);
            this.disconnect();
            reject(new Error("disconnected"));
          } else {
            console.info(message);
            resolve();
          }
        });

        onConnect();
      });

      this.socket.connect();
    });
  }

  /**
   * Disconnect from the server.
   */
  public disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Send an event to the connected server.
   * @param eventName  Event name.
   * @param args  Arguments associated with the event.
   */
  public emit(eventName: string, ...args: unknown[]): void {
    console.log(`send: ${eventName}`);
    console.log(...args);
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
    replyEventName: string,
    ...args: unknown[]
  ): Promise<unknown> {
    return new Promise<unknown>((resolve) => {
      this.socket.once(replyEventName, (data: unknown) => {
        resolve(data);
      });
      this.socket.emit(eventName, ...args.map((arg) => JSON.stringify(arg)));
    });
  }
}

interface SocketIOEventListener {
  eventName: string;
  eventHandler: (data?: unknown) => void;
}
