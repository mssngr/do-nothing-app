import jwt from 'jsonwebtoken'

export const appSecret = process.env.ACCESS_SECRET || 'access-placeholder'

export function generateToken({
  id,
  expiresIn,
  secret = appSecret,
}: {
  id: number
  expiresIn?: string
  secret?: string
}) {
  return jwt.sign({ id }, secret, { expiresIn })
}
