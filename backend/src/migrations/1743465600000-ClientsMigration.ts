import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClientsMigration1743465600000 implements MigrationInterface {
  name = 'ClientsMigration1743465600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id"                    uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"               uuid         NOT NULL,
        "name"                  varchar      NOT NULL,
        "email"                 varchar      NOT NULL,
        "phone"                 text,
        "addressAddress_line1"  text,
        "addressAddress_line2"  text,
        "addressAddress_city"   text,
        "addressAddress_state"  text,
        "addressAddress_zip"    text,
        "created_at"            TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"            TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_clients_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}
