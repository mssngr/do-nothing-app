import { use, server } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { auth } from 'nexus-plugin-jwt-auth'
import cors from 'cors'
import { appSecret } from './utils'

// Enables the Prisma plugin
use(prisma())

// Enables JWT Auth on protected paths
use(
  auth({
    appSecret,
    protectedPaths: [
      'Query.user',
      'Query.users',
      'Mutation.createOneUser',
      'Mutation.upsertOneUser',
      'Mutation.updateOneUser',
      'Mutation.updateManyUser',
      'Mutation.deleteOneUser',
      'Mutation.deleteManyUser',
    ],
  })
)

// Enable Express Middleware
server.express.use(cors())
