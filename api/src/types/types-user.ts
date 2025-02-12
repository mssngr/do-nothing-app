import type { Static } from '@sinclair/typebox'
import { t } from 'elysia'

export const UserSchema = t.Object({
  id: t.String(),
  salt: t.String(),
  passwordHash: t.String(),
  givenName: t.String({ minLength: 1 }),
  familyName: t.String({ minLength: 1 }),
  email: t.String({ format: 'email' }),
})
export type User = Static<typeof UserSchema>
