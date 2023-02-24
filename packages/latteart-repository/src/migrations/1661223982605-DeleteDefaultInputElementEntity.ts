import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteDefaultInputElementEntity1661223982605
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "DEFAULT_INPUT_ELEMENTS"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error("Irreversible migration.");
  }
}
