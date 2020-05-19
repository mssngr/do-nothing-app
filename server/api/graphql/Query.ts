import { schema } from 'nexus'
import jwt from 'jsonwebtoken'
import { ModelTypes } from 'typegen-nexus-prisma'
import * as R from 'ramda'
import * as U from '../utils'
import { ACCESS_SECRET, fieldsToEncrypt } from '../app'

export const Query = schema.queryType({
  definition(t) {
    t.field('user', {
      type: 'User',
      nullable: true,
      args: {
        id: schema.idArg(),
      },
      async resolve(parent, { id: providedID }, { token, db, log }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userID: string = (token as any).id
        const id = providedID || userID
        log.info(`${userID || 'Someone'} is trying to find User: ${id}`)
        try {
          const encryptedUser = await db.user.findOne({ where: { id } })
          if (encryptedUser) {
            log.info(`${userID || 'Someone'} successfully found User: ${id}`)
            const decryptedUser = R.mapObjIndexed(
              (text, key) =>
                fieldsToEncrypt.includes(key)
                  ? U.decrypt(text as string)
                  : text,
              encryptedUser
            ) as ModelTypes['User']
            log.info(
              `${userID || 'Someone'} successfully decrypted User: ${id}`
            )
            return decryptedUser
          }
          throw new Error(`User: ${id} could not be found`)
        } catch (error) {
          log.error(error)
          log.info(`${userID || 'Someone'} failed to find User: ${id}`)
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
          const decryptedUsers = encryptedUsers.map(
            encryptedUser =>
              R.mapObjIndexed(
                (text, key) =>
                  fieldsToEncrypt.includes(key)
                    ? U.decrypt(text as string)
                    : text,
                encryptedUser
              ) as ModelTypes['User']
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
          const id = (jwt.verify(accessToken, ACCESS_SECRET) as {
            id: string
          }).id
          const user = await db.user.findOne({ where: { id } })
          if (user?.id === id) {
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
