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

import { ImageFileRepositoryService } from "@/services/ImageFileRepositoryService";
import { NotesService } from "@/services/NotesService";
import { StaticDirectoryService } from "@/services/StaticDirectoryService";
import { TestPurposeService } from "@/services/TestPurposeService";
import { TestResultService } from "@/services/TestResultService";
import { TestStepService } from "@/services/TestStepService";
import { TimestampService } from "@/services/TimestampService";

export const createTimestampServiceMock = (): TimestampService => {
  return {
    unix: jest.fn(),
    format: jest.fn(),
    epochMilliseconds: jest.fn(),
  };
};

export const createTestResultServiceMock = (): TestResultService => {
  return {
    getTestResultIdentifiers: jest.fn(),
    getTestResult: jest.fn(),
    createTestResult: jest.fn(),
    patchTestResult: jest.fn(),
    collectAllTestStepIds: jest.fn(),
    collectAllTestPurposeIds: jest.fn(),
    collectAllTestStepScreenshots: jest.fn(),
    generateSequenceView: jest.fn(),
  };
};

export const createTestStepServiceMock = (): TestStepService => {
  return {
    getTestStep: jest.fn(),
    createTestStep: jest.fn(),
    attachNotesToTestStep: jest.fn(),
    attachTestPurposeToTestStep: jest.fn(),
    getTestStepOperation: jest.fn(),
    getTestStepScreenshot: jest.fn(),
  };
};

export const createImageFileRepositoryServiceMock =
  (): ImageFileRepositoryService => {
    return {
      writeBufferToFile: jest.fn(),
      writeBase64ToFile: jest.fn(),
      removeFile: jest.fn(),
      getFilePath: jest.fn(),
      getFileUrl: jest.fn(),
    };
  };

export const createStaticDirectoryServiceMock = (): StaticDirectoryService => {
  return {
    mkdir: jest.fn(),
    outputFile: jest.fn(),
    removeFile: jest.fn(),
    getFileUrl: jest.fn(),
    getJoinedPath: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    collectFileNames: jest.fn(),
    collectFilePaths: jest.fn(),
  };
};

export const createNotesServiceMock = (): NotesService => {
  return {
    createNote: jest.fn(),
    getNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    getNoteScreenshot: jest.fn(),
  };
};

export const createTestPurposeServiceMock = (): TestPurposeService => {
  return {
    createTestPurpose: jest.fn(),
    getTestPurpose: jest.fn(),
    updateTestPurpose: jest.fn(),
    deleteTestPurpose: jest.fn(),
  };
};
