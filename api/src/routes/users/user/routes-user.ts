import db from '@/db'
import { UserSchema } from '@/types'
import { Elysia, t } from 'elysia'

export default new Elysia()
  .use(db)
  .get(
    '/:id',
    async ({ params: { id }, db, error }) => {
      const user = await db.users.getUser(id)
      return user || error(404)
    },
    {
      params: t.Pick(UserSchema, ['id']),
    },
  )
  .post(
    '/:id',
    async ({ params: { id }, body, db, error }) => {
      const user = await db.users.getUser(id)
      if (!user) return error(404)
      return db.users.updateUser(id, body)
    },
    {
      params: t.Pick(UserSchema, ['id']),
      body: t.Partial(t.Omit(UserSchema, ['id', 'salt', 'passwordHash'])),
    },
  )
