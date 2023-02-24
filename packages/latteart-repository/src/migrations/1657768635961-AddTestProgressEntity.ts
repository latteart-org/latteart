import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export class AddTestProgressEntity1657768635961 implements MigrationInterface {
  name = "AddTestProgressEntity1657768635961";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "TEST_PROGRESSES" ("test_progress_id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "date" datetime NOT NULL, "planned" integer NOT NULL, "completed" integer NOT NULL, "incompleted" integer NOT NULL, "story_id" varchar)`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_PROGRESSES" ("test_progress_id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "date" datetime NOT NULL, "planned" integer NOT NULL, "completed" integer NOT NULL, "incompleted" integer NOT NULL, "story_id" varchar, CONSTRAINT "FK_532c5bd4fbbe290f013a5799934" FOREIGN KEY ("story_id") REFERENCES "STORIES" ("story_id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );

    const progressDataRecords: { date: string; text: string }[] =
      await queryRunner.query(`SELECT "date", "text" FROM "PROGRESS_DATAS"`);
    const dailyTestTargetProgresses = progressDataRecords.flatMap(
      (progressData) => {
        const groups: {
          id: string;
          name: string;
          testTargets: {
            id: string;
            name: string;
            progress: {
              completedNumber: number;
              incompletedNumber: number;
              planNumber: number;
            };
          }[];
        }[] = JSON.parse(progressData.text);

        return groups
          .flatMap((group) => group.testTargets)
          .map((testTarget) => {
            return {
              date: parseInt(progressData.date, 10),
              testTarget,
            };
          });
      }
    );

    for (const dailyTestTargetProgress of dailyTestTargetProgresses) {
      const storyRecords: { story_id: string }[] = await queryRunner.query(
        `SELECT "story_id" FROM "STORIES" WHERE "test_target_id" = "${dailyTestTargetProgress.testTarget.id}"`
      );

      if (storyRecords.length === 0) {
        continue;
      }

      const dateString = (() => {
        const dateObject = new Date(dailyTestTargetProgress.date * 1000);
        const utcYear = dateObject.getUTCFullYear();
        const utcMonth = String(dateObject.getUTCMonth() + 1).padStart(2, "0");
        const utcDate = String(dateObject.getUTCDate()).padStart(2, "0");
        const utcHours = String(dateObject.getUTCHours()).padStart(2, "0");
        const utcMinutes = String(dateObject.getUTCMinutes()).padStart(2, "0");
        const utcSeconds = String(dateObject.getUTCSeconds()).padStart(2, "0");
        return `${utcYear}-${utcMonth}-${utcDate} ${utcHours}:${utcMinutes}:${utcSeconds}`;
      })();
      const planned = dailyTestTargetProgress.testTarget.progress.planNumber;
      const completed =
        dailyTestTargetProgress.testTarget.progress.completedNumber;
      const incompletedSessionNumber =
        dailyTestTargetProgress.testTarget.progress.incompletedNumber;
      const storyId = storyRecords[0].story_id;
      const uuid = uuidv4();
      await queryRunner.query(
        `INSERT INTO "temporary_TEST_PROGRESSES"("test_progress_id", "date", "planned", "completed", "incompleted", "story_id") VALUES("${uuid}", "${dateString}", "${planned}", "${completed}", "${incompletedSessionNumber}", "${storyId}")`
      );
    }

    await queryRunner.query(`DROP TABLE "TEST_PROGRESSES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_PROGRESSES" RENAME TO "TEST_PROGRESSES"`
    );
    await queryRunner.query(`DROP TABLE "PROGRESS_DATAS"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error("Irreversible migration.");
  }
}
