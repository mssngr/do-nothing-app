import { schema } from 'nexus'
import jwt from 'jsonwebtoken'
import { uuid } from 'uuidv4'
import * as U from './utils'

const refreshSecret = process.env.REFRESH_SECRET || 'refresh-placeholder'

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
      args: {
        token: schema.stringArg({ required: true }),
      },
      async resolve(parent, { token }, { db, log }) {
        log.info(`Someone is trying to get a new accessToken.`)
        try {
          const id = (jwt.verify(token, refreshSecret) as any).id
          try {
            const foundUser = await db.user.findOne({
              where: { id },
            })
            const isRefreshTokenStillValid =
              !!foundUser?.refreshedAt &&
              new Date().getTime() - foundUser?.refreshedAt.getTime() < 8.64e7 // 1 day
            if (foundUser && isRefreshTokenStillValid) {
              const accessToken = U.generateToken({ id, expiresIn: '1 hour' })
              await db.user.update({
                where: { id },
                data: {
                  accessToken,
                  refreshedAt: new Date(),
                },
              })
              log.info(`${id} successfully got a new accessToken.`)
              return accessToken
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
      type: 'User',
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
            const updatedUser = await db.user.update({
              where: { id },
              data: {
                refreshToken: U.generateToken({ id, secret: refreshSecret }),
                accessToken: U.generateToken({ id, expiresIn: '1 hour' }),
                refreshedAt: new Date(),
              },
            })
            return updatedUser
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

    t.field('signup', {
      type: 'User',
      args: {
        firstName: schema.stringArg({ required: true }),
        lastName: schema.stringArg({ required: true }),
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
        phone: schema.stringArg({ required: true }),
        avatarUrl: schema.stringArg(),
      },
      async resolve(parent, newUser, { db, log }) {
        try {
          log.info(`${newUser.email} is trying to sign up.`)
          const activationCode = uuid()
          log.info(`Send activation email (${activationCode})`)
          const createdUser = await db.user.create({
            data: { ...newUser, activationCode, roles: { set: [] } },
          })
          const refreshToken = U.generateToken({
            id: createdUser.id,
            secret: refreshSecret,
          })
          const accessToken = U.generateToken({
            id: createdUser.id,
            expiresIn: '1 hour',
          })
          const updatedUser = await db.user.update({
            where: { id: createdUser.id },
            data: { refreshToken, accessToken },
          })
          log.info(`${updatedUser.email} successfully signed up`)
          return updatedUser
        } catch (error) {
          log.error(error)
          log.info(`${newUser.email} failed to log in.`)
          throw new Error(error)
        }
      },
    })
  },
})
