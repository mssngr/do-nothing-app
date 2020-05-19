import { schema } from 'nexus'
import * as R from 'ramda'
import jwt from 'jsonwebtoken'
import * as U from './utils'

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.phone()
    t.model.firstName()
    t.model.lastName()
    t.model.isActivated()
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

schema.objectType({
  name: 'AccessCredentials',
  definition(t) {
    t.field('id', { type: 'ID' })
    t.field('accessToken', { type: 'String' })
    t.field('refreshToken', { type: 'String' })
  },
})

schema.queryType({
  definition(t) {
    t.field('user', {
      type: 'User',
      nullable: true,
      args: {
        id: schema.idArg({ required: true }),
      },
      async resolve(parent, { id }, { db, log }) {
        log.info(`Someone is trying to find User: ${id}`)
        try {
          const encryptedUser = await db.user.findOne({ where: { id } })
          if (encryptedUser) {
            log.info(`Someone successfully found User: ${id}`)
            const decryptedUser: any = R.mapObjIndexed(
              (text, key) =>
                U.fieldsToEncrypt.includes(key)
                  ? U.decrypt(text as string)
                  : text,
              encryptedUser
            )
            return decryptedUser
          }
          throw new Error(`User: ${id} could not be found`)
        } catch (error) {
          log.error(error)
          log.info(`Someone failted to find User: ${id}`)
          return null
        }
      },
    })

    t.field('users', {
      type: 'User',
      list: true,
      args: {
        ids: schema.arg({ type: 'ID', list: true, nullable: true }),
      },
      async resolve(parent, { ids }, { db, log }) {
        log.info('Someone is trying to find users')
        try {
          const encryptedUsers = await db.user.findMany({
            where: { id: { in: ids } },
          })
          if (R.isEmpty(encryptedUsers)) {
            throw new Error('Users could not be found')
          }
          log.info('Someone successfully found users')
          const decryptedUsers: any[] = encryptedUsers.map(encryptedUser =>
            R.mapObjIndexed(
              (text, key) =>
                U.fieldsToEncrypt.includes(key)
                  ? U.decrypt(text as string)
                  : text,
              encryptedUser
            )
          )
          return decryptedUsers
        } catch (error) {
          log.error(error)
          return []
        }
      },
    })

    t.field('verify', {
      type: 'String',
      nullable: true,
      args: {
        accessToken: schema.stringArg({ required: true }),
      },
      async resolve(parent, { accessToken }, { db, log }) {
        log.info('Someone is trying to verify their access token')
        try {
          const id = (jwt.verify(accessToken, U.ACCESS_SECRET) as any).id
          const foundUser = await db.user.findOne({ where: { id } })
          if (foundUser?.id === id) {
            log.info(`${id} successfully verified their access token`)
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
    t.crud.updateOneUser()
    t.crud.deleteOneUser()

    t.field('refresh', {
      type: 'String',
      nullable: true,
      args: {
        refreshToken: schema.stringArg({ required: true }),
      },
      async resolve(parent, { refreshToken }, { db, log }) {
        log.info('Someone is trying to get a new accessToken')
        try {
          const id = (jwt.verify(refreshToken, U.REFRESH_SECRET) as any).id
          const foundUser = await db.user.findOne({
            where: { id },
          })
          const isRefreshTokenStillValid =
            !!foundUser?.refreshedAt &&
            new Date().getTime() - foundUser?.refreshedAt.getTime() < 8.64e7 // 1 day
          if (foundUser && isRefreshTokenStillValid) {
            const accessToken = U.generateToken({
              id,
              secret: U.ACCESS_SECRET,
              expiresIn: '1 hour',
            })
            await db.user.update({
              where: { id },
              data: {
                refreshedAt: new Date(),
              },
            })
            log.info(`${id} successfully got a new accessToken`)
            return accessToken
          }
          throw new Error(`User ${id} not found`)
        } catch (error) {
          log.error(error)
          log.info(`Someone failed to get a new accessToken`)
          return null
        }
      },
    })

    t.field('login', {
      type: 'AccessCredentials',
      args: {
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
      },
      async resolve(parent, { email, password }, { db, log }) {
        try {
          log.info(`${email} is trying to log in`)
          const foundUser = await db.user.findOne({
            where: { email },
          })
          const isAuthenticated =
            foundUser && U.checkPass(password, foundUser.hash)
          if (isAuthenticated) {
            const id = foundUser?.id as string
            const refreshToken = U.generateToken({
              id,
              secret: U.REFRESH_SECRET,
            })
            const accessToken = U.generateToken({
              id,
              secret: U.ACCESS_SECRET,
              expiresIn: '1 hour',
            })
            await db.user.update({
              where: { id },
              data: {
                refreshedAt: new Date(),
              },
            })
            log.info(`${email} successfully logged in`)
            return { id, accessToken, refreshToken }
          }
          throw new Error(`User ${email} not found or passwords do not match`)
        } catch (error) {
          log.error(error)
          log.info(`${email} failed to log in`)
          return null
        }
      },
    })

    t.field('signup', {
      type: 'AccessCredentials',
      args: {
        firstName: schema.stringArg({ required: true }),
        lastName: schema.stringArg({ required: true }),
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
        phone: schema.stringArg({ required: true }),
      },
      async resolve(parent, newUser, { db, log }) {
        try {
          log.info(`${newUser.email} is trying to sign up`)
          const encryptedFields: any = R.map(
            (val: string) => U.encrypt(val),
            R.pick(U.fieldsToEncrypt, newUser) as any
          )
          const hash = await U.hash(newUser.password)
          const createdUser = await db.user.create({
            data: { ...encryptedFields, hash },
          })
          const id = createdUser.id
          const refreshToken = U.generateToken({
            id,
            secret: U.REFRESH_SECRET,
          })
          const accessToken = U.generateToken({
            id,
            secret: U.ACCESS_SECRET,
            expiresIn: '1 hour',
          })
          const activationToken = U.generateToken({
            id,
            secret: U.ACTIVATION_SECRET,
            expiresIn: '1 day',
          })
          log.info(`${newUser.email} successfully signed up`)
          log.info(`Send activation email (${activationToken})`)
          return { id, accessToken, refreshToken }
        } catch (error) {
          log.error(error)
          log.info(`${newUser.email} failed to log in`)
          throw new Error(error)
        }
      },
    })

    t.field('activate', {
      type: 'Boolean',
      args: {
        activationToken: schema.stringArg({ required: true }),
      },
      async resolve(parent, { activationToken }, { db, log }) {
        try {
          log.info('Someone is trying to activate their account')
          const verifiedToken = jwt.verify(activationToken, U.ACTIVATION_SECRET)
          const id = (verifiedToken as any).id
          await db.user.update({ where: { id }, data: { isActivated: true } })
          return true
        } catch (error) {
          console.error(error)
          return false
        }
      },
    })
  },
})
