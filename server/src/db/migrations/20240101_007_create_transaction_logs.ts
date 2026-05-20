import type { Knex } from 'knex';

export const up = (knex: Knex) =>
  knex.schema.createTable('transaction_logs', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('transaction_id').unsigned().nullable();
    t.string('action', 255).nullable();
    t.string('performed_by', 100).nullable();
    t.text('log_message').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.foreign('transaction_id').references('transactions.id');
  });

export const down = (knex: Knex) => knex.schema.dropTableIfExists('transaction_logs');
