import type { Knex } from 'knex';

export const up = (knex: Knex) =>
  knex.schema.createTable('transactions', (t) => {
    t.bigIncrements('id').primary();
    t.string('transaction_code', 100).unique().nullable();
    t.integer('wallet_id').unsigned().notNullable();
    t.enu('type', ['deposit', 'withdrawal', 'transfer_sent', 'transfer_received']).notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.decimal('balance_before', 15, 2).nullable();
    t.decimal('balance_after', 15, 2).nullable();
    t.enu('status', ['pending', 'completed', 'failed']).defaultTo('pending');
    t.text('description').nullable();
    t.string('reference_id', 100).nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('wallet_id').references('wallets.id');
  });

export const down = (knex: Knex) => knex.schema.dropTableIfExists('transactions');
