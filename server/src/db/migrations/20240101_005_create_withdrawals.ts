import type { Knex } from 'knex';

export const up = (knex: Knex) =>
  knex.schema.createTable('withdrawals', (t) => {
    t.bigIncrements('id').primary();
    t.integer('wallet_id').unsigned().notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.string('phone_number', 20).notNullable();
    t.enu('status', ['pending', 'processing', 'completed', 'failed']).defaultTo('pending');
    t.bigInteger('mpesa_transaction_id').unsigned().nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('wallet_id').references('wallets.id');
    t.foreign('mpesa_transaction_id').references('mpesa_transactions.id');
  });

export const down = (knex: Knex) => knex.schema.dropTableIfExists('withdrawals');
