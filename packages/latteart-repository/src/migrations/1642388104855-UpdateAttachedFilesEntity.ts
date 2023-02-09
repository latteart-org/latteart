import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAttachedFilesEntity1642388104855
  implements MigrationInterface
{
  name = "UpdateAttachedFilesEntity1642388104855";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_ATTACHED_FILES" ("name" varchar NOT NULL, "file_url" varchar NOT NULL, "createdDate" datetime NOT NULL DEFAULT (datetime('now')), "session_id" varchar NOT NULL, CONSTRAINT "FK_8dd3a1f2ec25553750070a8c198" FOREIGN KEY ("session_id") REFERENCES "SESSIONS" ("session_id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("name", "file_url", "session_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_ATTACHED_FILES"("name", "file_url", "createdDate", "session_id") SELECT "name", "image_url", "createdDate", "session_id" FROM "ATTACHED_FILES"`
    );
    await queryRunner.query(`DROP TABLE "ATTACHED_FILES"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_ATTACHED_FILES" RENAME TO "ATTACHED_FILES"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ATTACHED_FILES" RENAME TO "temporary_ATTACHED_FILES"`
    );
    await queryRunner.query(
      `CREATE TABLE "ATTACHED_FILES" ("name" varchar NOT NULL, "image_url" varchar NOT NULL, "createdDate" datetime NOT NULL DEFAULT (datetime('now')), "session_id" varchar NOT NULL, CONSTRAINT "FK_8dd3a1f2ec25553750070a8c198" FOREIGN KEY ("session_id") REFERENCES "SESSIONS" ("session_id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("name", "image_url", "session_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "ATTACHED_FILES"("name", "image_url", "createdDate", "session_id") SELECT "name", "file_url", "createdDate", "session_id" FROM "temporary_ATTACHED_FILES"`
    );
    await queryRunner.query(`DROP TABLE "temporary_ATTACHED_FILES"`);
  }
}
