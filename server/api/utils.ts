import jwt from 'jsonwebtoken'

export const appSecret = process.env.ACCESS_SECRET || 'access-placeholder'

export function generateToken({
  id,
  expiresIn,
  secret = appSecret,
}: {
  id: string
  expiresIn?: string
  secret?: string
}) {
  const options = expiresIn ? { expiresIn } : {}
  return jwt.sign({ id }, secret, options)
}
