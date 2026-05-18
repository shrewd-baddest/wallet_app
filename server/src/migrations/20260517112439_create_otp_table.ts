import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable("otp_verification");
  if (hasTable) {
    return;
  }

        await knex.schema.createTable("otp_verification", (table) => {
             table.bigIncrements('id').primary();

    table.string('phone_number', 20);

    table.string('otp_code', 10);

    table.timestamp('expires_at');

    table.boolean('verified')
      .defaultTo(false);

    table.timestamp('created_at')
      .defaultTo(knex.fn.now());
        });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("otp_verification");
}

