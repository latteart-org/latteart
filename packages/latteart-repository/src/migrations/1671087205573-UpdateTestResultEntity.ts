import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTestResultEntity1671087205573 implements MigrationInterface {
  name = "UpdateTestResultEntity1671087205573";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_TEST_RESULTS" ("test_result_id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "start_timestamp" integer NOT NULL, "initial_url" varchar NOT NULL, "last_update_timestamp" integer NOT NULL, "testing_time" integer NOT NULL)`
    );

    const testResultRecords: {
      test_result_id: string;
      name: string;
      start_timestamp: number;
      initial_url: string;
    }[] = await queryRunner.query(
      `SELECT "test_result_id", "name", "start_timestamp", "initial_url" FROM "TEST_RESULTS"`
    );

    for (const testResultRecord of testResultRecords) {
      const testStepRecords: { timestamp: number }[] = await queryRunner.query(
        `SELECT "timestamp" FROM "TEST_STEPS" WHERE "test_result_id" = "${testResultRecord.test_result_id}" ORDER BY "timestamp" ASC`
      );

      const lastTestStartTime =
        testStepRecords.find((testStepRecord) => {
          return testStepRecord.timestamp > testResultRecord.start_timestamp;
        })?.timestamp ?? testResultRecord.start_timestamp;

      const lastTestingTime = (() => {
        const lastOperationTimestamp =
          testStepRecords
            .slice()
            .reverse()
            .find((testStepRecord) => {
              return testStepRecord.timestamp;
            })?.timestamp ?? lastTestStartTime;

        return lastOperationTimestamp - lastTestStartTime;
      })();

      const otherTestingTime = (() => {
        const otherTestStep = testStepRecords.filter((testStepRecord) => {
          return testStepRecord.timestamp < lastTestStartTime;
        });
        if (otherTestStep.length > 0) {
          const otherStartTime = otherTestStep[0].timestamp;
          const otherEndTime =
            otherTestStep[otherTestStep.length - 1].timestamp;
          return otherEndTime - otherStartTime;
        } else {
          return 0;
        }
      })();

      const lastUpdateTimestamp =
        testStepRecords.length > 0 ? testStepRecords[0].timestamp : 0;

      const testingTime = lastTestingTime + otherTestingTime;

      await queryRunner.query(
        `INSERT INTO "temporary_TEST_RESULTS"("test_result_id", "name", "start_timestamp", "last_update_timestamp", "initial_url", "testing_time") VALUES("${testResultRecord.test_result_id}", "${testResultRecord.name}", "${testResultRecord.start_timestamp}", "${lastUpdateTimestamp}", "${testResultRecord.initial_url}", "${testingTime}")`
      );
    }

    await queryRunner.query(`DROP TABLE "TEST_RESULTS"`);

    await queryRunner.query(
      `ALTER TABLE "temporary_TEST_RESULTS" RENAME TO "TEST_RESULTS"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error("Irreversible migration.");
  }
}
