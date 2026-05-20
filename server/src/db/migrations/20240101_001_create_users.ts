import type { Knex } from 'knex';

export const up = (knex: Knex) =>
  knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('full_name', 100).notNullable();
    t.string('email', 100).unique().nullable();
    t.string('phone_number', 20).unique().notNullable();
    t.string('password', 255).notNullable();
    t.boolean('is_verified').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });

export const down = (knex: Knex) => knex.schema.dropTableIfExists('users');
