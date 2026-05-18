import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

await knex.schema.createTable("transfers", (table) => {
 table.bigIncrements('id').primary();

    table.integer('sender_wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');

    table.integer('receiver_wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');

    table.decimal('amount', 15, 2)
      .notNullable();

    table.enu('status', [
      'pending',
      'completed',
      'failed'
    ]).defaultTo('completed');

    table.timestamp('created_at')
      .defaultTo(knex.fn.now());
}
);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("transfers");
}

