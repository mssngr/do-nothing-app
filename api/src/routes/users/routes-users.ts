import db from '@/db'
import { UserSchema } from '@/types'
import { Elysia, t } from 'elysia'
import * as _ from 'es-toolkit'
import user from './user'

export default new Elysia({ prefix: '/users' })
  .use(db)
  .use(user)
  .get(
    '/',
    ({ query, db }) => {
      const filters = _.omitBy(query, _.isUndefined)
      return db.users.getUsers(filters)
    },
    {
      query: t.Partial(UserSchema),
    },
  )
  .post(
    '/',
    ({ body: { password, ...newUser }, db }) =>
      db.users.createUser(password, newUser),
    {
      body: t.Composite([
        t.Object({ password: t.String() }),
        t.Omit(UserSchema, ['id', 'salt', 'passwordHash']),
      ]),
    },
  )
