import db from '@/db'
import logging from '@/logging'
import login from '@/routes/login'
import users from '@/routes/users'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'

export const testResponse = 'Hello, world!'

export const app = new Elysia()
  .use(swagger())
  .use(logging)
  .use(rateLimit({ max: Bun.env.NODE_ENV === 'production' ? 10 : 1000 }))
  .use(db)
  .use(login)
  .use(users)
  .get('/', () => testResponse)
  .listen(3000)

console.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
