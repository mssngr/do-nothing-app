import { schema } from 'nexus'
import jwt from 'jsonwebtoken'
import * as R from 'ramda'
import * as U from './utils'

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.phone()
    t.model.firstName()
    t.model.lastName()
    t.model.passwordAttempts()
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
    t.field('id', { type: 'ID', nullable: true })
    t.field('accessToken', { type: 'String', nullable: true })
    t.field('refreshToken', { type: 'String', nullable: true })
    t.field('passwordAttempts', { type: 'Int', nullable: true })
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
          log.info('Someone failed to get a new accessToken')
          return null
        }
      },
    })

    t.field('login', {
      type: 'AccessCredentials',
      nullable: true,
      args: {
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
      },
      async resolve(parent, { email, password }, { db, log }) {
        try {
          log.info('Someone is trying to log in')
          const emailIndex = U.blindIndex(email)
          const foundUser = await db.user.findOne({
            where: { emailIndex },
          })
          if (foundUser) {
            const isLocked = foundUser.passwordAttempts > 4
            if (isLocked) {
              log.info(
                `Account is locked. User ${foundUser?.id} must reset their password`
              )
              const passwordAttempts = foundUser.passwordAttempts + 1
              await db.user.update({
                where: { emailIndex },
                data: {
                  passwordAttempts,
                },
              })
              return { passwordAttempts }
            }
            const isAuthenticated = await U.checkPass(password, foundUser.hash)
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
                  passwordAttempts: 0,
                },
              })
              log.info(`${id} successfully logged in`)
              return { id, accessToken, refreshToken }
            }
            log.info('Passwords do not match')
            const passwordAttempts = foundUser.passwordAttempts + 1
            await db.user.update({
              where: { emailIndex },
              data: {
                passwordAttempts,
              },
            })
            return { passwordAttempts }
          }
          log.info('Email not found')
          return null
        } catch (error) {
          log.error(error)
          log.info('Someone failed to log in')
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
          log.info('Someone is trying to sign up')
          if (newUser.password.length < 8) {
            throw new Error('Password is not long enough (8 chars minimum)')
          }
          const encryptedFields: any = R.map(
            (val: string) => U.encrypt(val),
            R.pick(U.fieldsToEncrypt, newUser) as any
          )
          const emailIndex = U.blindIndex(newUser.email)
          const hash = await U.hash(newUser.password)
          const createdUser = await db.user.create({
            data: { ...encryptedFields, emailIndex, hash },
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
          log.info(`${createdUser.id} successfully signed up`)
          log.info(
            `Send activation email (http://localhost:3000/activation/${activationToken})`
          )
          return { id, accessToken, refreshToken }
        } catch (error) {
          log.error(error)
          log.info('Someone failed to sign up')
          throw new Error(error)
        }
      },
    })

    t.field('sendActivationEmail', {
      type: 'Boolean',
      async resolve(parent, args, { db, log, token }) {
        log.info('Someone is trying to get an activation email')
        try {
          const id = (token as any).id
          const user = await db.user.findOne({ where: { id } })
          if (user) {
            const activationToken = U.generateToken({
              id: user.id,
              secret: U.ACTIVATION_SECRET,
              expiresIn: '1 hour',
            })
            log.info(
              `Send activation email (http://localhost:3000/activation/${activationToken})`
            )
            log.info(`${user.id} successfully got a reset password email`)
            return true
          }
          throw new Error('Email not found')
        } catch (error) {
          console.error(error)
          log.info('Someone failed to get an activation email')
          return false
        }
      },
    })

    t.field('activate', {
      type: 'Boolean',
      args: {
        activationToken: schema.stringArg({ required: true }),
      },
      async resolve(parent, { activationToken }, { db, log }) {
        log.info('Someone is trying to activate their account')
        try {
          const verifiedToken = jwt.verify(activationToken, U.ACTIVATION_SECRET)
          const id = (verifiedToken as any).id
          await db.user.update({ where: { id }, data: { isActivated: true } })
          log.info(`${id} successfully activated their account`)
          return true
        } catch (error) {
          console.error(error)
          log.info('Someone failed to activate their account')
          return false
        }
      },
    })

    t.field('sendResetEmail', {
      type: 'Boolean',
      args: {
        email: schema.stringArg({ required: true }),
      },
      async resolve(parent, { email }, { db, log }) {
        log.info('Someone is trying to get a reset password email')
        try {
          const emailIndex = U.blindIndex(email)
          const user = await db.user.findOne({ where: { emailIndex } })
          if (user) {
            const activationToken = U.generateToken({
              id: user.id,
              secret: U.ACTIVATION_SECRET,
              expiresIn: '1 hour',
            })
            log.info(
              `Send reset password email (http://localhost:3000/reset/${activationToken})`
            )
            log.info(`${user.id} successfully got a reset password email`)
            return true
          }
          throw new Error('Email not found')
        } catch (error) {
          console.error(error)
          log.info('Someone failed to get a reset password email')
          return false
        }
      },
    })

    t.field('resetPassword', {
      type: 'Boolean',
      args: {
        resetToken: schema.stringArg({ required: true }),
        newPassword: schema.stringArg({ required: true }),
      },
      async resolve(parent, { resetToken, newPassword }, { db, log }) {
        log.info('Someone is trying to reset their password')
        try {
          if (newPassword.length < 8) {
            throw new Error('Password is not long enough (8 chars minimum)')
          }
          const verifiedToken = jwt.verify(resetToken, U.ACTIVATION_SECRET)
          const id = (verifiedToken as any).id
          const hash = await U.hash(newPassword)
          await db.user.update({
            where: { id },
            data: { hash, passwordAttempts: 0 },
          })
          log.info(`${id} successfully reset their password`)
          return true
        } catch (error) {
          console.error(error)
          log.info('Someone failed to reset their password')
          return false
        }
      },
    })
  },
})
