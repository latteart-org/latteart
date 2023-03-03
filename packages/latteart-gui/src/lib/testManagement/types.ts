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

import {
  TestMatrixForRepository,
  GroupForRepository,
  ViewPointForRepository,
  TestTargetForRepository,
  PlanForRepository,
  StoryForRepository,
  SessionForRepository,
  AttachedFileForRepository,
  TestResultFileForRepository,
  ProjectForRepository,
  DailyTestProgressForRepository,
  PatchSessionDto,
} from "latteart-client";

export type TestMatrix = TestMatrixForRepository;

export type Group = GroupForRepository;

export type ViewPoint = ViewPointForRepository;

export type ViewPointsPreset = {
  id: string;
  name: string;
  viewPoints: ViewPoint[];
};

export type TestTarget = TestTargetForRepository;

export type Plan = PlanForRepository;

export type Story = StoryForRepository;

export type Session = SessionForRepository;

export type AttachedFile = AttachedFileForRepository;

export type TestResultFile = TestResultFileForRepository;

export type DeleteDialogObj = {
  title: string;
  text: string;
  callback: () => void;
  closeCallback: () => void;
};

export type DetailedExportDialogObj = {
  groups: Group[];
  callback: (groupId: string, testTargetId: string) => void;
  closeCallback: () => void;
};

export type DetailedReportObj = {
  groupId: string;
  groupName: string;
  testTargetid: string;
  testTargetname: string;
  viewPointId: string;
  viewPointName: string;
};

export type Project = ProjectForRepository;

export type DailyTestProgress = DailyTestProgressForRepository;

export type PatchSession = PatchSessionDto;
