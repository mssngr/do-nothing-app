import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import CryptoJS from 'crypto-js'
import { ENCRYPTION_KEY, BLIND_INDEX_SECRET } from './app'

export function generateToken({
  id,
  secret,
  expiresIn,
}: {
  id: string
  secret: string
  expiresIn?: string
}): string {
  const options = expiresIn ? { expiresIn } : {}
  return jwt.sign({ id }, secret, options)
}

export async function hash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function checkPass(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

export function decrypt(text: string): string {
  return CryptoJS.AES.decrypt(text, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
}

export function blindIndex(text: string): string {
  return CryptoJS.HmacSHA256(text, BLIND_INDEX_SECRET).toString()
}
