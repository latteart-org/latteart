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

import { EntityManager, getManager } from "typeorm";
import { createLogger } from "./logger/logger";

export class TransactionRunner {
  private queue: {
    runInTransaction: (
      transactionalEntityManager: EntityManager
    ) => Promise<unknown>;
  }[] = [];

  constructor(private maxRetry: number = 20) {}

  async waitAndRun(
    runInTransaction: (
      transactionalEntityManager: EntityManager
    ) => Promise<unknown>
  ): Promise<unknown> {
    const queueItem = { runInTransaction };

    this.queue.unshift(queueItem);

    for (let i = 0; i < this.maxRetry; i++) {
      createLogger().info("Try starting transaction.");

      if (!this.queueItemIsNext(queueItem)) {
        createLogger().warn("Transaction is locked.");
        await this.sleep(200);
        continue;
      }

      try {
        const result = await getManager().transaction(
          queueItem.runInTransaction
        );

        this.queue.pop();

        return result;
      } catch (error) {
        if (
          error instanceof Error &&
          [
            "TransactionAlreadyStartedError",
            "TransactionNotStartedError",
          ].includes(error.name)
        ) {
          createLogger().warn("Transaction is locked.");
          if (i === this.maxRetry - 1) {
            this.queue.pop();
            throw error;
          }
          await this.sleep(200);
          continue;
        }
        this.queue.pop();
        throw error;
      }
    }
  }

  private queueItemIsNext(queueItem: {
    runInTransaction: (
      transactionalEntityManager: EntityManager
    ) => Promise<unknown>;
  }) {
    const next = this.queue[this.queue.length - 1];
    return !next || (next && next === queueItem);
  }

  private sleep(milliSeconds: number) {
    return new Promise((resolve) => setTimeout(() => resolve(0), milliSeconds));
  }
}
