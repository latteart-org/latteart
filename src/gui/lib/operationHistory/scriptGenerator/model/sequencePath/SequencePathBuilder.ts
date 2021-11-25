/**
 * Copyright 2021 NTT Corporation.
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

import { Sequence } from "./Sequence";
import { SequenceSourceFactory } from "./SequenceSourceFactory";
import { SequenceSource } from "./SequenceSourceFactory";
import { Operation } from "@/lib/operationHistory/Operation";
import { IdentifierUtil } from "../../IdentifierUtil";

export type SequencePath = Sequence[];

export class SequencePathBuilder {
  public build(sources: Operation[][]): SequencePath[] {
    const normalizedHistories = SequencePathBuilder.normalizeScreenDef(sources);

    const sequenceSourcePaths = new SequenceSourceFactory().create(
      normalizedHistories.map((source) => source.map((operation) => operation))
    );

    const sequencePaths = sequenceSourcePaths.map((pathNodes) => {
      return pathNodes.map((pathNode, index, array) => {
        const destination: SequenceSource | undefined = array[index + 1];

        return {
          className: pathNode.screenDef,
          destination: destination?.screenDef ?? pathNode.screenDef,
          destinationUrl: destination?.url ?? pathNode.url,
          operations: pathNode.operations,
          url: pathNode.url,
          imageUrl: pathNode.imageUrl,
        };
      });
    });

    return sequencePaths;
  }

  private static normalizeScreenDef(histories: Operation[][]): Operation[][] {
    const classNameCount: Map<string, number> = new Map();
    const screenDefClassMap: Map<string, string> = new Map();

    const generateClassName = (screenDef: string) => {
      let className = IdentifierUtil.normalizeAndToCamelCase(screenDef, true);

      if (className.match(/^[0-9]/)) {
        className = "_" + className;
      }

      if (classNameCount.has(className)) {
        const count = classNameCount.get(className)!;
        classNameCount.set(className, count + 1);
        className += (count + 1).toString();
      } else {
        classNameCount.set(className, 1);
      }

      return className;
    };

    return histories.map((history: Operation[]) => {
      return history.map((item: Operation) => {
        const screenDef = item.screenDef;

        if (!screenDefClassMap.has(screenDef)) {
          const className = generateClassName(screenDef);
          screenDefClassMap.set(screenDef, className);
        }

        item.screenDef = screenDefClassMap.get(screenDef)!;

        return item;
      });
    });
  }
}
