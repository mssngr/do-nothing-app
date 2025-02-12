import { type User, UserSchema } from '@/types'
import { Type } from '@sinclair/typebox'
import { type AssertError, Value } from '@sinclair/typebox/value'
import argon2 from 'argon2'
import * as _ from 'es-toolkit'

export const db: Record<string, User> = {
  abc: {
    id: 'abc',
    salt: 'def',
    passwordHash: await argon2.hash('def+p4ssw0rd!+def'),
    givenName: 'Gabriel',
    familyName: 'Konkle',
    email: 'fake@email.com',
  },
}

export default {
  async getUsers(filters?: Partial<User>) {
    const dbUsers = Object.values(db)
    const filtersArray = filters ? Object.entries(filters) : []
    const filteredUsers = dbUsers.filter(user =>
      filtersArray.every(([key, value]) => user[key as keyof User] === value),
    )
    const users = filteredUsers.map(user =>
      _.omit(user, ['salt', 'passwordHash']),
    )
    return users
  },
  async getUser(id: string) {
    const dbUser = db[id]
    const user = dbUser && _.omit(dbUser, ['salt', 'passwordHash'])
    return user
  },
  async getUserCredentials(email: string) {
    const dbUser = Object.values(db).find(user => user.email === email)
    return (
      dbUser && {
        id: dbUser.id,
        salt: dbUser.salt,
        passwordHash: dbUser.passwordHash,
      }
    )
  },
  async createUser(
    password: string,
    userInfo: Omit<User, 'id' | 'salt' | 'passwordHash'>,
  ) {
    // Ensure user passes schema validation
    try {
      Value.Assert(
        Type.Omit(UserSchema, ['id', 'salt', 'passwordHash']),
        userInfo,
      )
    } catch (e: unknown) {
      const error = e as AssertError
      throw new Error(error.message)
    }

    // Ensure email is unique
    const emailExists = Object.values(db).some(
      user => user.email === userInfo.email,
    )
    if (emailExists) {
      throw new Error('Email already exists')
    }

    // Create user
    const id = Math.random().toString(36).slice(2)
    const salt = Math.random().toString(36).slice(2)
    db[id] = {
      id,
      salt,
      passwordHash: await argon2.hash(`${salt}+${password}!+${salt}`),
      ...userInfo,
    }
    const user = _.omit(db[id], ['salt', 'passwordHash'])
    return user
  },
  async updateUser(id: string, updates: Partial<User>) {
    // Ensure user exists
    const user = db[id]
    if (!user) throw new Error('User not found')

    // Ensure updates pass schema validation
    try {
      Value.Assert(
        Type.Partial(Type.Omit(UserSchema, ['id', 'salt', 'passwordHash'])),
        updates,
      )
    } catch (e: unknown) {
      const error = e as AssertError
      throw new Error(error.message)
    }

    // Ensure email is unique
    if (updates.email) {
      const emailExists = Object.values(db).some(
        user => user.email === updates.email,
      )
      if (emailExists) {
        throw new Error('Email already exists')
      }
    }

    // Update user
    db[id] = { ...db[id], ...updates }
    const updatedUser = _.omit(db[id], ['salt', 'passwordHash'])
    return updatedUser
  },
  async deleteUser(id: string) {
    delete db[id]
    return true
  },
}
