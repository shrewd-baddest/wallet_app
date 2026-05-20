"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.b2cPayment = exports.stkQuery = exports.stkPush = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../../utils/logger"));
const BASE = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const KEY = process.env.MPESA_CONSUMER_KEY;
const SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CB_BASE = process.env.MPESA_CALLBACK_BASE_URL;
const B2C_SHORTCODE = process.env.MPESA_B2C_SHORTCODE;
const INITIATOR = process.env.MPESA_B2C_INITIATOR_NAME;
const INITIATOR_PWD = process.env.MPESA_B2C_INITIATOR_PASSWORD;
// ── Token cache ────────────────────────────────────────────────────────────
let _token = null;
let _tokenExpiry = 0;
const getAccessToken = async () => {
    if (_token && Date.now() < _tokenExpiry)
        return _token;
    const creds = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
    const { data } = await axios_1.default.get(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${creds}` } });
    _token = data.access_token;
    _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return _token;
};
// ── Timestamp helper ───────────────────────────────────────────────────────
const getTimestamp = () => {
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
const stkPush = async (phoneNumber, amount, accountRef = 'MVPWallet') => {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    const payload = {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${CB_BASE}/api/mpesa/stk-callback`,
        AccountReference: accountRef,
        TransactionDesc: 'Wallet Deposit',
    };
    logger_1.default.debug(`STK push → ${phoneNumber} KES ${amount}`);
    const { data } = await axios_1.default.post(`${BASE}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};
exports.stkPush = stkPush;
// ── STK query ──────────────────────────────────────────────────────────────
const stkQuery = async (checkoutRequestId) => {
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    const { data } = await axios_1.default.post(`${BASE}/mpesa/stkpushquery/v1/query`, { BusinessShortCode: SHORTCODE, Password: password, Timestamp: timestamp, CheckoutRequestID: checkoutRequestId }, { headers: { Authorization: `Bearer ${token}` } });
    return data;
};
exports.stkQuery = stkQuery;
// ── B2C (withdrawal / payout) ──────────────────────────────────────────────
const b2cPayment = async (phoneNumber, amount, remarks = 'Wallet Withdrawal') => {
    const token = await getAccessToken();
    const payload = {
        InitiatorName: INITIATOR,
        SecurityCredential: INITIATOR_PWD,
        CommandID: 'BusinessPayment',
        Amount: Math.ceil(amount),
        PartyA: B2C_SHORTCODE,
        PartyB: phoneNumber,
        Remarks: remarks,
        QueueTimeOutURL: `${CB_BASE}/api/mpesa/b2c-timeout`,
        ResultURL: `${CB_BASE}/api/mpesa/b2c-callback`,
        Occasion: 'Withdrawal',
    };
    logger_1.default.debug(`B2C payout → ${phoneNumber} KES ${amount}`);
    const { data } = await axios_1.default.post(`${BASE}/mpesa/b2c/v3/paymentrequest`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};
exports.b2cPayment = b2cPayment;
exports.default = { getAccessToken, stkPush: exports.stkPush, stkQuery: exports.stkQuery, b2cPayment: exports.b2cPayment };
