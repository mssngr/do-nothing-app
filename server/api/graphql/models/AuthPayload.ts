import { schema } from 'nexus'

export const AuthPayload = schema.objectType({
  name: 'AuthPayload',
  definition(t) {
    t.field('id', { type: 'ID', nullable: true })
    t.field('accessToken', { type: 'String', nullable: true })
    t.field('refreshToken', { type: 'String', nullable: true })
    t.field('passwordAttempts', { type: 'Int', nullable: true })
  },
})
