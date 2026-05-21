import axios from 'axios';
import logger from '../../utils/logger';

const BASE      = process.env.MPESA_BASE_URL       || 'https://sandbox.safaricom.co.ke';
const KEY       = process.env.MPESA_CONSUMER_KEY;
const SECRET    = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY   = process.env.MPESA_PASSKEY;
const CB_BASE   = process.env.MPESA_CALLBACK_BASE_URL;

const B2C_SHORTCODE = process.env.MPESA_B2C_SHORTCODE;
const INITIATOR     = process.env.MPESA_B2C_INITIATOR_NAME;
const INITIATOR_PWD = process.env.MPESA_B2C_INITIATOR_PASSWORD;

// ── Token cache ────────────────────────────────────────────────────────────
let _token: string | null = null;
let _tokenExpiry = 0;

const getAccessToken = async (): Promise<string> => {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const creds = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
  try {
    const { data } = await axios.get<{ access_token: string; expires_in: number }>(
      `${BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${creds}` } }
    );

    _token = data.access_token;
    _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return _token;
  } catch (err: any) {
    logger.error('M-Pesa token fetch failed:', err.message || err);
    throw err;
  }
};

// ── Timestamp helper ───────────────────────────────────────────────────────
const getTimestamp = (): string => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
};

// ── STK Push (deposit) ─────────────────────────────────────────────────────
export const stkPush = async (
  phoneNumber: string,
  amount: number,
  accountRef = 'MVPWallet'
): Promise<any> => {
  const token     = await getAccessToken();
  const timestamp = getTimestamp();
  const password  = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            Math.ceil(amount),
    PartyA:            phoneNumber,
    PartyB:            SHORTCODE,
    PhoneNumber:       phoneNumber,
    CallBackURL:       `${CB_BASE}/api/mpesa/stk-callback`,
    AccountReference:  accountRef,
    TransactionDesc:   'Wallet Deposit',
  };

  logger.debug(`STK push → ${phoneNumber} KES ${amount}`);
  try {
    const { data } = await axios.post(`${BASE}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (err: any) {
    logger.error('M-Pesa STK push failed:', err.message || err);
    if (err.response) {
      return {
        ResponseCode: String(err.response.status),
        errorMessage: err.response.data?.message || JSON.stringify(err.response.data || {}),
      };
    }
    return { ResponseCode: 'ERR', errorMessage: err.message || 'Unknown error' };
  }
};

// ── STK query ──────────────────────────────────────────────────────────────
export const stkQuery = async (checkoutRequestId: string): Promise<any> => {
  const token     = await getAccessToken();
  const timestamp = getTimestamp();
  const password  = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const { data } = await axios.post(
    `${BASE}/mpesa/stkpushquery/v1/query`,
    { BusinessShortCode: SHORTCODE, Password: password, Timestamp: timestamp, CheckoutRequestID: checkoutRequestId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};

// ── B2C (withdrawal / payout) ──────────────────────────────────────────────
export const b2cPayment = async (
  phoneNumber: string,
  amount: number,
  remarks = 'Wallet Withdrawal'
): Promise<any> => {
  const token = await getAccessToken();

  const payload = {
    InitiatorName:      INITIATOR,
    SecurityCredential: INITIATOR_PWD,
    CommandID:          'BusinessPayment',
    Amount:             Math.ceil(amount),
    PartyA:             B2C_SHORTCODE,
    PartyB:             phoneNumber,
    Remarks:            remarks,
    QueueTimeOutURL:    `${CB_BASE}/api/mpesa/b2c-timeout`,
    ResultURL:          `${CB_BASE}/api/mpesa/b2c-callback`,
    Occasion:           'Withdrawal',
  };

  logger.debug(`B2C payout → ${phoneNumber} KES ${amount}`);
  try {
    const { data } = await axios.post(`${BASE}/mpesa/b2c/v3/paymentrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (err: any) {
    logger.error('M-Pesa B2C payment failed:', err.message || err);
    if (err.response) {
      return {
        ResponseCode: String(err.response.status),
        errorMessage: err.response.data?.message || JSON.stringify(err.response.data || {}),
      };
    }
    return { ResponseCode: 'ERR', errorMessage: err.message || 'Unknown error' };
  }
};

export default { getAccessToken, stkPush, stkQuery, b2cPayment };
