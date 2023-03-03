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

import { ScreenTransitionGraphBuilderImpl } from "./ScreenTransitionGraphBuilder";
import { ScreenTransitionPathBuilder } from "./types";

export class GraphBasedScreenTransitionPathBuilder
  implements ScreenTransitionPathBuilder
{
  public build(screenDefPaths: string[][]): string[][] {
    const paths = screenDefPaths
      .filter((screenDefs) => {
        return screenDefs.length > 0;
      })
      .flatMap((screenDefs) => {
        const graph = new ScreenTransitionGraphBuilderImpl().build(screenDefs);

        return GraphBasedScreenTransitionPathBuilder.constructPaths(
          screenDefs[0],
          graph
        );
      });

    // Apply twice because the path may be included in another path as a result of pruning.
    const once = GraphBasedScreenTransitionPathBuilder.prunePaths(paths);
    once.sort((path1, path2) => path2.length - path1.length);

    return GraphBasedScreenTransitionPathBuilder.prunePaths(once);
  }

  private static constructPaths(
    firstNodeScreenDef: string,
    graph: Map<string, Set<string>>
  ): string[][] {
    const paths: string[][] = [];

    const BFS = () => {
      const queue: string[][] = [];

      queue.push([firstNodeScreenDef]);

      while (queue.length !== 0) {
        const path = queue.shift()!;
        const cur = path[path.length - 1];

        if (path.slice(0, -1).includes(cur)) {
          paths.push(path);
          continue;
        }

        if (graph.get(cur)!.size === 0) {
          paths.push(path);
          continue;
        }

        graph.get(cur)!.forEach((next) => {
          if (cur !== next) {
            const nextPath = path.slice();
            nextPath.push(next);
            queue.push(nextPath);
          }
        });
      }
    };

    const DFS = () => {
      const registerPathsRec = (cur: string, path: string[]) => {
        if (path.includes(cur)) {
          path.push(cur);
          paths.push(path);
          return;
        }
        path.push(cur);
        graph.get(cur)!.forEach((next: string) => {
          if (cur !== next) {
            registerPathsRec(next, path.slice());
          }
        });
      };
      registerPathsRec(firstNodeScreenDef, []);
    };

    BFS();

    return paths;
  }

  /**
   * remove redundant paths and cut off redundant tail from paths
   * @param paths
   */
  private static prunePaths(paths: string[][]): string[][] {
    const visitedEdges: Map<string, Set<string>> = new Map();

    const fixedPath: string[][] = [];

    paths.forEach((path: string[]) => {
      let prev: string | undefined;
      if (
        GraphBasedScreenTransitionPathBuilder.isIncludeNewEdge(
          path,
          visitedEdges
        )
      ) {
        fixedPath.push(
          GraphBasedScreenTransitionPathBuilder.cutRedundantTail(
            path,
            visitedEdges
          )
        );
      }
      path.forEach((screenDef: string) => {
        if (!visitedEdges.has(screenDef)) {
          visitedEdges.set(screenDef, new Set());
        }
        if (prev !== undefined) {
          visitedEdges.get(prev)!.add(screenDef);
        }
        prev = screenDef;
      });
    });
    return fixedPath;
  }

  private static range(n: number) {
    return [...new Array(n).keys()];
  }

  private static isIncludeNewEdge(
    path: string[],
    visitedEdge: Map<string, Set<string>>
  ) {
    return GraphBasedScreenTransitionPathBuilder.range(path.length - 1).reduce(
      (acc: boolean, i) =>
        acc ||
        !visitedEdge.has(path[i]) ||
        !visitedEdge.get(path[i])!.has(path[i + 1]),
      false
    );
  }

  // Cut off edges from tail if these are already visited
  private static cutRedundantTail(
    path: string[],
    visitedEdge: Map<string, Set<string>>
  ) {
    const last = GraphBasedScreenTransitionPathBuilder.range(
      path.length - 1
    ).reduce((acc: number, i) => {
      if (
        !visitedEdge.has(path[i]) ||
        !visitedEdge.get(path[i])!.has(path[i + 1])
      ) {
        return i + 2;
      } else {
        return acc;
      }
    }, 0);
    return path.slice(0, last);
  }
}
