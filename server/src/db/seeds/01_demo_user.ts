import bcrypt from 'bcryptjs';
import type { Knex } from 'knex';

export const seed = async (knex: Knex): Promise<void> => {
  // Clean tables in reverse FK order
  await knex('transaction_logs').del();
  await knex('otp_verifications').del();
  await knex('transfers').del();
  await knex('withdrawals').del();
  await knex('transactions').del();
  await knex('mpesa_transactions').del();
  await knex('wallets').del();
  await knex('users').del();

  const hash = await bcrypt.hash('Password1!', 10);

  const [userId] = await knex('users').insert({
    full_name:    'Jane Wanjiru',
    email:        'jane@example.com',
    phone_number: '254712345678',
    password:     hash,
    is_verified:  true,
  });

  await knex('wallets').insert({
    user_id:  userId,
    balance:  234580.00,
    currency: 'KES',
    status:   'active',
  });
};
