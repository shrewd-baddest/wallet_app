import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable("withdrawals", (table) => {
               table.bigIncrements('id').primary();

    table.integer('wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');

    table.decimal('amount', 15, 2)
      .notNullable();

    table.string('phone_number', 20)
      .notNullable();

    table.enu('status', [
      'pending',
      'processing',
      'completed',
      'failed'
    ]).defaultTo('pending');

    table.bigInteger('mpesa_transaction_id')
      .unsigned()
      .references('id')
      .inTable('mpesa_transactions')
      .onDelete('SET NULL');

    table.timestamp('created_at')
      .defaultTo(knex.fn.now());
        });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("withdrawals");
}

