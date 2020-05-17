import { schema } from 'nexus'
import * as R from 'ramda'
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
    t.model.isActivated()
    t.model.activationCode()
    t.model.accessToken()
    t.model.refreshToken()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.refreshedAt()

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

    t.field('verify', {
      type: 'String',
      nullable: true,
      args: {
        accessToken: schema.stringArg({ required: true }),
      },
      async resolve(parent, { accessToken }, { db, log }) {
        log.info('Someone is trying to verify their access token')
        try {
          const id = (jwt.verify(accessToken, U.appSecret) as any).id
          const foundUser = await db.user.findOne({ where: { id } })
          if (foundUser?.id === id) {
            log.info(`${id} successfully verified their access token.`)
            return id
          }
          throw new Error(`User ${id} not found`)
        } catch (error) {
          log.error(error)
          log.info('Someone failed to verify their access token')
          return null
        }
      },
    })
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

    t.field('refresh', {
      type: 'String',
      nullable: true,
      args: {
        refreshToken: schema.stringArg({ required: true }),
      },
      async resolve(parent, { refreshToken }, { db, log }) {
        log.info('Someone is trying to get a new accessToken.')
        try {
          const id = (jwt.verify(refreshToken, refreshSecret) as any).id
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
          throw new Error(`User ${id} not found`)
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
          if (R.isEmpty(foundUsers)) {
            throw new Error(`User ${email} not found`)
          }
          const id = foundUsers[0].id
          const updatedUser = await db.user.update({
            where: { id },
            data: {
              refreshToken: U.generateToken({ id, secret: refreshSecret }),
              accessToken: U.generateToken({ id, expiresIn: '1 hour' }),
              refreshedAt: new Date(),
            },
          })
          log.info(`${email} successfully logged in.`)
          return updatedUser
        } catch (error) {
          log.error(error)
          log.info(`${email} failed to log in.`)
          return null
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
          const createdUser = await db.user.create({
            data: { ...newUser, activationCode, roles: { set: [] } },
          })
          log.info(`Send activation email (${activationCode})`)
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
