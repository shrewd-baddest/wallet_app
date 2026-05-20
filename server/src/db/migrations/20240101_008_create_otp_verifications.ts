import type { Knex } from 'knex';

export const up = (knex: Knex) =>
  knex.schema.createTable('otp_verifications', (t) => {
    t.bigIncrements('id').primary();
    t.string('phone_number', 20).nullable();
    t.string('otp_code', 10).nullable();
    t.timestamp('expires_at').nullable();
    t.boolean('verified').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

export const down = (knex: Knex) => knex.schema.dropTableIfExists('otp_verifications');
