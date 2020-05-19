import { schema } from 'nexus'
import jwt from 'jsonwebtoken'
import { ModelTypes } from 'typegen-nexus-prisma'
import * as R from 'ramda'
import * as U from '../utils'
import {
  REFRESH_SECRET,
  ACCESS_SECRET,
  ACTIVATION_SECRET,
  fieldsToEncrypt,
} from '../app'

export const Mutation = schema.mutationType({
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
          const id = (jwt.verify(refreshToken, REFRESH_SECRET) as {
            id: string
          }).id
          const foundUser = await db.user.findOne({
            where: { id },
          })
          const isRefreshTokenStillValid =
            !!foundUser?.refreshedAt &&
            new Date().getTime() - foundUser?.refreshedAt.getTime() < 8.64e7 // 1 day
          if (foundUser && isRefreshTokenStillValid) {
            const accessToken = U.generateToken({
              id,
              secret: ACCESS_SECRET,
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
      type: 'AuthPayload',
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
                secret: REFRESH_SECRET,
              })
              const accessToken = U.generateToken({
                id,
                secret: ACCESS_SECRET,
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
      type: 'AuthPayload',
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
          const encryptedFields: ModelTypes['User'] = R.map(
            (val: string) => U.encrypt(val),
            R.pick(fieldsToEncrypt, newUser)
          )
          const emailIndex = U.blindIndex(newUser.email)
          const hash = await U.hash(newUser.password)
          const createdUser = await db.user.create({
            data: { ...encryptedFields, emailIndex, hash },
          })
          const id = createdUser.id
          const refreshToken = U.generateToken({
            id,
            secret: REFRESH_SECRET,
          })
          const accessToken = U.generateToken({
            id,
            secret: ACCESS_SECRET,
            expiresIn: '1 hour',
          })
          const activationToken = U.generateToken({
            id,
            secret: ACTIVATION_SECRET,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const id = (token as any).id
          const user = await db.user.findOne({ where: { id } })
          if (user) {
            const activationToken = U.generateToken({
              id: user.id,
              secret: ACTIVATION_SECRET,
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
          const verifiedToken = jwt.verify(activationToken, ACTIVATION_SECRET)
          const id = (verifiedToken as { id: string }).id
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
              secret: ACTIVATION_SECRET,
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
          const verifiedToken = jwt.verify(resetToken, ACTIVATION_SECRET)
          const id = (verifiedToken as { id: string }).id
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
