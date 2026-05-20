import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: number;
  phone_number: string;
}

export const sign = (payload: JwtPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);

export const verify = (token: string): JwtPayload =>
  jwt.verify(token, SECRET) as JwtPayload;
