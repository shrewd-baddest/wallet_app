"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const up = (knex) => knex.schema.createTable('otp_verifications', (t) => {
    t.bigIncrements('id').primary();
    t.string('phone_number', 20).nullable();
    t.string('otp_code', 10).nullable();
    t.timestamp('expires_at').nullable();
    t.boolean('verified').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
});
exports.up = up;
const down = (knex) => knex.schema.dropTableIfExists('otp_verifications');
exports.down = down;
