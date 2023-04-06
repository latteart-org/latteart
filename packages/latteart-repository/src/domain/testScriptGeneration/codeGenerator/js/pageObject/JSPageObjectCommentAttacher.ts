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

import { PageObjectCommentAttacher } from "../../types";
import { PageObject, PageObjectImpl } from "../../../model";
import { MermaidScreenTransitionDiagram } from "../../../docGenerator/screenTransitionDiagram/MermaidScreenTransitionDiagram";
import { JSPageObjectCommentGenerator } from "./JSPageObjectCommentGenerator";
import { JSPageObjectMethodCommentGenerator } from "./JSPageObjectMethodCommentGenerator";
import {
  ScreenTransitionGraph,
  ScreenTransitionGraphImpl,
} from "../../../model";
import { NameGenerator } from "../../types";
import { PageObjectMethodImpl } from "../../../model";

export class JSPageObjectCommentAttacher implements PageObjectCommentAttacher {
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    },
    private pageObjects: PageObject[]
  ) {}

  public attachComment(
    pageObject: PageObject,
    testSuiteGraph: ScreenTransitionGraph
  ): PageObject {
    const pageObjectGraph = this.buildPageObjectGraph(pageObject);

    const newPageObject = new PageObjectImpl(
      {
        id: pageObject.id,
        url: pageObject.url,
        methods: pageObject.methods.map((method) => {
          const destPageObject = {
            name: method.returnPageObjectId,
            imageUrl:
              this.pageObjects.find((po) => po.id === method.returnPageObjectId)
                ?.imageUrl ?? "",
          };

          const newMethod = new PageObjectMethodImpl({
            id: method.id,
            pageObjectId: method.pageObjectId,
            operations: method.operations,
            returnPageObjectId: method.returnPageObjectId,
          });

          newMethod.comment =
            new JSPageObjectMethodCommentGenerator().generateFrom(
              this.nameGenerator.method.generate(method.id),
              method.operations,
              destPageObject
            );

          return newMethod;
        }),
      },
      {
        methodFilters: [],
        methodComparator: pageObject.methodComparator,
      }
    );

    newPageObject.comment = new JSPageObjectCommentGenerator().generateFrom(
      this.nameGenerator.pageObject.generate(pageObject.id),
      pageObject.id,
      pageObject.imageUrl ?? "",
      new MermaidScreenTransitionDiagram(testSuiteGraph, {
        strong: pageObjectGraph,
      })
    );

    return newPageObject;
  }

  private buildPageObjectGraph(pageObject: PageObject) {
    const screenTransitions = pageObject.methods.map((method) => {
      const sourceScreenName = method.pageObjectId;
      const destScreenName = method.returnPageObjectId;
      const trigger = this.nameGenerator.method.generate(method.id);

      return { sourceScreenName, destScreenName, trigger };
    });

    return new ScreenTransitionGraphImpl(screenTransitions);
  }
}
