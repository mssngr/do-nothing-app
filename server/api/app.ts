import { use, server } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { auth } from 'nexus-plugin-jwt-auth'
import cors from 'cors'
import { ACCESS_SECRET } from './utils'

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
