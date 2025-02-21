/**
 * Copyright 2025 NTT Corporation.
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
import { ElementInfo } from "@/domain/types";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { SettingsUtility } from "@/gateways/settings/SettingsUtility";

export const mergeCoverage = async (
  testResultEntity: TestResultEntity,
  screenElements: ElementInfo[],
  url: string,
  title: string
) => {
  const targetCoverageSource = testResultEntity.coverageSources?.find(
    (coverageSource) => {
      return coverageSource.title === title && coverageSource.url === url;
    }
  );
  if (targetCoverageSource) {
    const newElements: ElementInfo[] = [
      ...JSON.parse(targetCoverageSource.screenElements),
      ...removeIgnoreTagsFrom(screenElements),
    ];
    targetCoverageSource.screenElements = JSON.stringify(
      newElements.filter((newElement, index) => {
        return (
          newElements.findIndex(
            (elem) =>
              elem.xpath + elem.iframe?.index ===
              newElement.xpath + newElement.iframe?.index
          ) === index
        );
      })
    );
  } else {
    testResultEntity.coverageSources?.push(
      new CoverageSourceEntity({
        title: title,
        url: url,
        screenElements: JSON.stringify(screenElements),
        testResult: testResultEntity,
      })
    );
  }
};

const removeIgnoreTagsFrom = (screenElements: ElementInfo[]): ElementInfo[] => {
  const ignoreTags = SettingsUtility.getSetting(
    "captureSettings.ignoreTags"
  ) as string[];

  return screenElements.filter((elmInfo) => {
    return !(
      ignoreTags.includes(elmInfo.tagname.toUpperCase()) ||
      ignoreTags.includes(elmInfo.tagname.toLowerCase())
    );
  });
};
