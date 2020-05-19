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
    t.crud.deleteOneUser()

    t.field('updateOneUserInfo', {
      type: 'User',
      args: {
        firstName: schema.stringArg(),
        lastName: schema.stringArg(),
        phone: schema.stringArg(),
      },
      async resolve(parent, updates, { token, db, log }) {
        const id: string = (token as any).id // eslint-disable-line @typescript-eslint/no-explicit-any
        log.info(`${id} is trying to update their info`)
        try {
          if (R.isEmpty(updates)) {
            throw new Error('No updates were provided')
          }
          const encryptedFields: ModelTypes['User'] = R.map(
            (val: string) => U.encrypt(val),
            (R.pick(fieldsToEncrypt, updates || {}) || {}) as any // eslint-disable-line @typescript-eslint/no-explicit-any
          ) as any // eslint-disable-line @typescript-eslint/no-explicit-any
          const updatedUser = await db.user.update({
            where: { id },
            data: encryptedFields,
          })
          log.info(`${id} successfully updated their info`)
          return updatedUser
        } catch (error) {
          log.error(error)
          log.info(`${id} failed to update their info`)
          throw new Error(error)
        }
      },
    })

    t.field('updateOneUserEmail', {
      type: 'String',
      args: {
        email: schema.stringArg({ required: true }),
      },
      async resolve(parent, { email }, { token, db, log }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const id: string = (token as any).id
        log.info(`${id} is trying to update their email`)
        try {
          await db.user.update({
            where: { id },
            data: {
              email: U.encrypt(email),
              emailIndex: U.blindIndex(email),
              isActivated: false,
            },
          })
          const activationToken = U.generateToken({
            id,
            secret: ACTIVATION_SECRET,
            expiresIn: '1 day',
          })
          log.info(`${id} successfully updated their email`)
          log.info(
            `Send activation email (http://localhost:3000/activation/${activationToken})`
          )
          return email
        } catch (error) {
          console.error(error)
          log.info(`${id} failed to update their email`)
          throw new Error(error)
        }
      },
    })

    t.field('updateOneUserPassword', {
      type: 'Boolean',
      args: {
        password: schema.stringArg({ required: true }),
      },
      async resolve(parent, { password }, { token, db, log }) {
        if (password.length < 8) {
          throw new Error('Password is not long enough (8 chars minimum)')
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const id: string = (token as any).id
        log.info(`${id} is trying to update their password`)
        try {
          await db.user.update({
            where: { id },
            data: {
              hash: await U.hash(password),
            },
          })
          log.info(`${id} successfully updated their password`)
          return true
        } catch (error) {
          console.error(error)
          log.info(`${id} failed to update their password`)
          throw new Error(error)
        }
      },
    })

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
          const user = await db.user.findOne({
            where: { id },
          })
          const isRefreshTokenStillValid =
            !!user?.refreshedAt &&
            new Date().getTime() - user?.refreshedAt.getTime() < 8.64e7 // 1 day
          if (user && isRefreshTokenStillValid) {
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
          const user = await db.user.findOne({
            where: { emailIndex },
          })
          if (user) {
            const isLocked = user.passwordAttempts > 4
            if (isLocked) {
              log.info(
                `Account is locked. User ${user?.id} must reset their password`
              )
              const passwordAttempts = user.passwordAttempts + 1
              await db.user.update({
                where: { emailIndex },
                data: {
                  passwordAttempts,
                },
              })
              return { passwordAttempts }
            }
            const isAuthenticated = await U.checkPass(password, user.hash)
            if (isAuthenticated) {
              const id = user?.id as string
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
            const passwordAttempts = user.passwordAttempts + 1
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
          const id: string = (token as any).id
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
        password: schema.stringArg({ required: true }),
      },
      async resolve(parent, { resetToken, password }, { db, log }) {
        log.info('Someone is trying to reset their password')
        try {
          if (password.length < 8) {
            throw new Error('Password is not long enough (8 chars minimum)')
          }
          const verifiedToken = jwt.verify(resetToken, ACTIVATION_SECRET)
          const id = (verifiedToken as { id: string }).id
          const hash = await U.hash(password)
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
