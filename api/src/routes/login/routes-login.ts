import db from '@/db'
import { jwt } from '@elysiajs/jwt'
import argon2 from 'argon2'
import { Elysia, t } from 'elysia'
import * as _ from 'es-toolkit'

const accessTokenDuration = 1000 * 60 * 20 // 20 mins
const refreshTokenDuration = 1000 * 60 * 60 * 24 * 14 // 2 weeks

export default new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: 'secret',
    }),
  )
  .use(db)
  .post(
    '/login',
    async ({
      body: { email, password },
      jwt,
      db,
      cookie: { access, refresh },
      error,
    }) => {
      try {
        const credentials = await db.users.getUserCredentials(email)
        if (!credentials) {
          throw new Error('Credentials not found')
        }
        const isValidPassword = await argon2.verify(
          credentials.passwordHash,
          `${credentials.salt}+${password}+${credentials.salt}`,
        )
        if (isValidPassword) {
          const user = await db.users.getUser(credentials.id)
          access.set({
            value: await jwt.sign({
              id: user.id,
              iat: Date.now(),
              exp: Date.now() + accessTokenDuration,
            }),
            httpOnly: true,
            sameSite: 'strict',
            // secure: true,
            maxAge: accessTokenDuration,
          })
          refresh.set({
            value: await jwt.sign({
              id: user.id,
              iat: Date.now(),
              exp: Date.now() + refreshTokenDuration,
            }),
            httpOnly: true,
            sameSite: 'strict',
            maxAge: refreshTokenDuration,
          })
          return user
        }
        throw new Error('Invalid password')
      } catch (e: unknown) {
        const err = e as Error
        if (
          err.message === 'Credentials not found' ||
          err.message === 'Invalid password'
        ) {
          return error(401)
        }
        console.error(err.message)
        return error(500)
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )
