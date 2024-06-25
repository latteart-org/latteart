import "reflect-metadata";

import path from "path";
import { DataSource } from "typeorm";
import { CoverageSourceEntity } from "./entities/CoverageSourceEntity";
import { NoteEntity } from "./entities/NoteEntity";
import { ScreenshotEntity } from "./entities/ScreenshotEntity";
import { TagEntity } from "./entities/TagEntity";
import { TestPurposeEntity } from "./entities/TestPurposeEntity";
import { TestResultEntity } from "./entities/TestResultEntity";
import { TestStepEntity } from "./entities/TestStepEntity";
import { AttachedFileEntity } from "./entities/AttachedFilesEntity";
import { ConfigEntity } from "./entities/ConfigEntity";
import { ProjectEntity } from "./entities/ProjectEntity";
import { SessionEntity } from "./entities/SessionEntity";
import { SnapshotEntity } from "./entities/SnapshotEntity";
import { StoryEntity } from "./entities/StoryEntity";
import { TestMatrixEntity } from "./entities/TestMatrixEntity";
import { TestTargetEntity } from "./entities/TestTargetEntity";
import { TestTargetGroupEntity } from "./entities/TestTargetGroupEntity";
import { ViewPointEntity } from "./entities/ViewPointEntity";
import { ViewPointPresetEntity } from "./entities/ViewPointPresetEntity";
import { TestProgressEntity } from "./entities/TestProgressEntity";
import { VideoEntity } from "./entities/VideoEntity";
import { Init1638930268191 } from "./migrations/1638930268191-Init";
import { UpdateProjectEntity1641956149882 } from "./migrations/1641956149882-UpdateProjectEntity";
import { UpdateAttachedFilesEntity1642388104855 } from "./migrations/1642388104855-UpdateAttachedFilesEntity";
import { UpdateViewPointEntity1654749340817 } from "./migrations/1654749340817-UpdateViewPointEntity";
import { UpdateViewPointEntity1655772848395 } from "./migrations/1655772848395-UpdateViewPointEntity";
import { UpdateSessionEntity1656305325919 } from "./migrations/1656305325919-UpdateSessionEntity";
import { AddTestProgressEntity1657768635961 } from "./migrations/1657768635961-AddTestProgressEntity";
import { DeleteDefaultInputElementEntity1661223982605 } from "./migrations/1661223982605-DeleteDefaultInputElementEntity";
import { UpdateTestStepEntity1666848612089 } from "./migrations/1666848612089-UpdateTestStepEntity";
import { UpdateTestResultEntity1671087205573 } from "./migrations/1671087205573-UpdateTestResultEntity";
import { UpdateTestStepEntity1677835465468 } from "./migrations/1677835465468-UpdateTestStepEntity";
import { UpdateTestResultEntity1680078703857 } from "./migrations/1680078703857-UpdateTestResultEntity";
import { UpdateTestResultEntity1689841542715 } from "./migrations/1689841542715-UpdateTestResultEntity";
import { AddVideoEntity1693220246649 } from "./migrations/1693220246649-AddVideoEntity";
import { LinkMultipleTestResultsToSession1694494561042 } from "./migrations/1694494561042-LinkMultipleTestResultsToSession";
import { appRootPath } from "./common";
import { extensions } from "./extensions";

const extensionEntities = extensions.flatMap(({ entities }) => entities);
const extensionMigrations = extensions.flatMap(({ migrations }) => migrations);

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: `${path.join(appRootPath, "latteart.sqlite")}`,
  logging: false,
  entities: [
    CoverageSourceEntity,
    NoteEntity,
    ScreenshotEntity,
    TagEntity,
    TestPurposeEntity,
    TestResultEntity,
    TestStepEntity,
    AttachedFileEntity,
    ConfigEntity,
    ProjectEntity,
    SessionEntity,
    SnapshotEntity,
    StoryEntity,
    TestMatrixEntity,
    TestTargetEntity,
    TestTargetGroupEntity,
    ViewPointEntity,
    ViewPointPresetEntity,
    TestProgressEntity,
    VideoEntity,
    ...extensionEntities,
  ],
  migrations: [
    Init1638930268191,
    UpdateProjectEntity1641956149882,
    UpdateAttachedFilesEntity1642388104855,
    UpdateViewPointEntity1654749340817,
    UpdateViewPointEntity1655772848395,
    UpdateSessionEntity1656305325919,
    AddTestProgressEntity1657768635961,
    DeleteDefaultInputElementEntity1661223982605,
    UpdateTestStepEntity1666848612089,
    UpdateTestResultEntity1671087205573,
    UpdateTestStepEntity1677835465468,
    UpdateTestResultEntity1680078703857,
    UpdateTestResultEntity1689841542715,
    AddVideoEntity1693220246649,
    LinkMultipleTestResultsToSession1694494561042,
    ...extensionMigrations,
  ],
});
