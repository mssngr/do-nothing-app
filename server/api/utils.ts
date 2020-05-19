import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import CryptoJS from 'crypto-js'

export const REFRESH_SECRET =
  process.env.REFRESH_SECRET || 'refresh-placeholder'
export const ACTIVATION_SECRET =
  process.env.ACTIVATION_SECRET || 'activation-placeholder'
export const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-placeholder'
export const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'encryption-placeholder'

export const fieldsToEncrypt = ['firstName', 'lastName', 'email', 'phone']

export function generateToken({
  id,
  secret,
  expiresIn,
}: {
  id: string
  secret: string
  expiresIn?: string
}) {
  const options = expiresIn ? { expiresIn } : {}
  return jwt.sign({ id }, secret, options)
}

export async function hash(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function checkPass(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

export function encrypt(text: string) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

export function decrypt(text: string) {
  return CryptoJS.AES.decrypt(text, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
}
