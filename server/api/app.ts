import { use, server } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { auth } from 'nexus-plugin-jwt-auth'
import cors from 'cors'

export const REFRESH_SECRET =
  process.env.REFRESH_SECRET || 'refresh-placeholder'
export const ACTIVATION_SECRET =
  process.env.ACTIVATION_SECRET || 'activation-placeholder'
export const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-placeholder'
export const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'encryption-placeholder'
export const BLIND_INDEX_SECRET =
  process.env.BLIND_INDEX_SECRET || 'blind-index-placeholder'

export const fieldsToEncrypt = ['firstName', 'lastName', 'email', 'phone']

// Enables the Prisma plugin
use(prisma())

// Enables JWT Auth on protected paths
use(
  auth({
    appSecret: ACCESS_SECRET,
    protectedPaths: [
      'Query.user',
      'Query.users',
      'Mutation.updateOneUser',
      'Mutation.deleteOneUser',
      'Mutation.updateEmail',
      'Mutation.updatePassword',
      'Mutation.sendActivationEmail',
    ],
  })
)

// Enable Express Middleware
server.express.use(
  cors(
    process.env.NODE_ENV === 'production'
      ? {
          origin: process.env.DOMAIN,
        }
      : undefined
  )
)
