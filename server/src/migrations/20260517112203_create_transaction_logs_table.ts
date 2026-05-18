import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  const hasTable = await knex.schema.hasTable("transaction_logs");
  if (hasTable) {
    return;
  }
        await knex.schema.createTable("transaction_logs", (table) => {
            table.bigIncrements('id').primary();

    table.integer('transaction_id')
      .unsigned()
      .references('id')
      .inTable('transactions')
      .onDelete('CASCADE');

    table.string('action', 255);

    table.string('performed_by', 100);

    table.text('log_message');

    table.timestamp('created_at')
      .defaultTo(knex.fn.now());
  });
};



export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("transaction_logs");
}

