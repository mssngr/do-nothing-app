import jwt from 'jsonwebtoken'
import forge from 'node-forge'

export const REFRESH_SECRET =
  process.env.REFRESH_SECRET || 'refresh-placeholder'
export const ACTIVATION_SECRET =
  process.env.ACTIVATION_SECRET || 'activation-placeholder'
export const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-placeholder'
export const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || forge.random.getBytesSync(16)

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

export function saltAndHash(string: string) {
  const salt = forge.random.getBytesSync(16)
  const messageDigest = forge.md.sha256.create()
  messageDigest.update(string)
  const hash = messageDigest.digest().toHex()
  return { salt, hash }
}

export function encrypt(string: string) {
  const key = forge.random.getBytesSync(16)
  const iv = forge.random.getBytesSync(16)
}

export function decrypt(string: string) {}
