import { Elysia } from 'elysia'
import users from './users'

export default new Elysia().decorate('db', {
  users,
})
