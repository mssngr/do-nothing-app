import { schema } from 'nexus'
import jwt from 'jsonwebtoken'
import * as U from './utils'

const refreshSecret = process.env.REFRESH_SECRET || 'refresh-placeholder'

schema.addToContext(req => ({ headers: req.headers }))

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.phone()
    t.model.firstName()
    t.model.lastName()
    t.model.password()
    t.model.avatarUrl()
    t.model.roles()
    t.model.activationCode()
    t.model.isActivated()

    t.string('fullName', {
      resolve({ firstName, lastName }) {
        return `${firstName} ${lastName}`
      },
    })
  },
})

schema.queryType({
  definition(t) {
    t.crud.user()
    t.crud.users()
  },
})

schema.mutationType({
  definition(t) {
    t.crud.createOneUser()
    t.crud.upsertOneUser()
    t.crud.updateOneUser()
    t.crud.updateManyUser()
    t.crud.deleteOneUser()
    t.crud.deleteManyUser()

    t.field('refreshToken', {
      type: 'String',
      nullable: true,
      async resolve(parent, args, { db, log, headers }) {
        log.info(`Someone is trying to get a new accessToken.`)
        try {
          const token = headers.authorization
            ?.replace('Bearer ', '')
            .replace('bearer ', '')
            .replace('JWT ', '')
            .replace('jwt', '')
          const id = (jwt.verify(token || '', refreshSecret) as any).id
          try {
            const foundUser = await db.user.findOne({
              where: { id },
            })
            const isRefreshTokenStillValid =
              !!foundUser?.refreshedAt &&
              new Date().getTime() - foundUser?.refreshedAt.getTime() < 8.64e7 // 1 day
            if (foundUser && isRefreshTokenStillValid) {
              log.info(`${id} successfully got a new accessToken.`)
              db.user.update({
                where: { id },
                data: { refreshedAt: new Date() },
              })
              return U.generateToken({ id, expiresIn: '1 hour' })
            }
            log.info(`${id} failed to get a new accessToken.`)
            return null
          } catch (error) {
            log.error(error)
            log.info(`${id} failed to get a new accessToken.`)
            throw new Error(error)
          }
        } catch (error) {
          log.error(error)
          log.info(`Someone failed to get a new accessToken.`)
          return null
        }
      },
    })

    t.field('login', {
      type: 'String',
      list: true,
      args: {
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
      },
      async resolve(parent, { email, password }, { db, log }) {
        try {
          log.info(`${email} is trying to log in.`)
          const foundUsers = await db.user.findMany({
            first: 1,
            where: { email, password },
          })
          if (foundUsers.length === 1) {
            log.info(`${email} successfully logged in.`)
            const id = foundUsers[0].id
            db.user.update({ where: { id }, data: { refreshedAt: new Date() } })
            return [
              U.generateToken({ id, secret: refreshSecret }),
              U.generateToken({ id, expiresIn: '1 hour' }),
            ]
          }
          log.info(`${email} failed to log in.`)
          return null
        } catch (error) {
          log.error(error)
          log.info(`${email} failed to log in.`)
          throw new Error(error)
        }
      },
    })
  },
})
