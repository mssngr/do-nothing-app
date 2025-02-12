import { describe, expect, it } from 'bun:test'
import type { User } from '@/types'
import type { AssertError } from '@sinclair/typebox/value'
import dbUsers from './db-users'

describe('getUsers', () => {
  it('gets multiple users', async () => {
    const users = await dbUsers.getUsers()
    expect(users).toHaveLength(1)
  })

  it('redacts credentials', async () => {
    const users = await dbUsers.getUsers()
    expect((users[0] as User).salt).toBeUndefined()
    expect((users[0] as User).passwordHash).toBeUndefined()
  })

  it('filters users', async () => {
    const frankUsers = await dbUsers.getUsers({ givenName: 'Frank' })
    const gabrielUsers = await dbUsers.getUsers({ givenName: 'Gabriel' })
    expect(frankUsers).toHaveLength(0)
    expect(gabrielUsers).toHaveLength(1)
  })
})

describe('getUser', () => {
  it('gets individual users', async () => {
    const user = await dbUsers.getUser('abc')
    expect(user.givenName).toBe('Gabriel')
  })

  it('redacts credentials', async () => {
    const user = await dbUsers.getUser('abc')
    expect((user as User).salt).toBeUndefined()
    expect((user as User).passwordHash).toBeUndefined()
  })
})

describe('getUserCredentials', () => {
  it('gets user credentials', async () => {
    const credentials = await dbUsers.getUserCredentials('fake@email.com')
    expect(credentials?.salt).toBe('def')
  })
})

describe('createUser', () => {
  it('creates users', async () => {
    const { id } = await dbUsers.createUser('password', {
      email: 'llane@thedailyplanet.com',
      givenName: 'Lois',
      familyName: 'Lane',
    })
    const newUser = await dbUsers.getUser(id)
    expect(newUser.givenName).toBe('Lois')
    dbUsers.deleteUser(id) // Cleanup
  })

  it('throws an error if the email is invalid', async () => {
    try {
      await dbUsers.createUser('password', {
        email: 'not an email',
        givenName: 'Lois',
        familyName: 'Lane',
      })
      expect(true).toBe(false) // Ensure catch block is executed
    } catch (e: unknown) {
      const error = e as AssertError
      expect(error.message).toBe("Expected string to match 'email' format")
    }
  })

  it('throws an error if the email is not unique', async () => {
    try {
      await dbUsers.createUser('password', {
        email: 'fake@email.com',
        givenName: 'Lois',
        familyName: 'Lane',
      })
      expect(true).toBe(false) // Ensure catch block is executed
    } catch (e: unknown) {
      const error = e as Error
      expect(error.message).toBe('Email already exists')
    }
  })
})

describe('updateUser', () => {
  it('updates users', async () => {
    const { id } = await dbUsers.createUser('password', {
      email: 'ckent@thedailyplanet.com',
      givenName: 'Clarke',
      familyName: 'Kent',
    })
    await dbUsers.updateUser(id, { givenName: 'Clark' })
    const updatedUser = await dbUsers.getUser(id)
    expect(updatedUser.givenName).toBe('Clark')
    dbUsers.deleteUser(id) // Cleanup
  })

  it('throws an error if the user does not exist', async () => {
    try {
      await dbUsers.updateUser('wrong-id', { givenName: 'Clark' })
    } catch (e: unknown) {
      const error = e as Error
      expect(error.message).toBe('User not found')
    }
  })

  it('throws an error if the email is invalid', async () => {
    try {
      await dbUsers.updateUser('abc', {
        email: 'not an email',
      })
      expect(true).toBe(false) // Ensure catch block is executed
    } catch (e: unknown) {
      const error = e as AssertError
      expect(error.message).toBe("Expected string to match 'email' format")
    }
  })

  it('throws an error if the email is not unique', async () => {
    await dbUsers.createUser('password', {
      email: 'atotallyunique@email.com',
      givenName: 'Perry',
      familyName: 'White',
    })
    try {
      await dbUsers.updateUser('abc', {
        email: 'atotallyunique@email.com',
      })
      expect(true).toBe(false) // Ensure catch block is executed
    } catch (e: unknown) {
      const error = e as Error
      expect(error.message).toBe('Email already exists')
    }
  })
})

describe('deleteUser', () => {
  it('deletes users', async () => {
    const { id } = await dbUsers.createUser('password', {
      email: 'pwhite@thedailyplanet.com',
      givenName: 'Perry',
      familyName: 'White',
    })
    await dbUsers.deleteUser(id)
    const deletedUser = await dbUsers.getUser(id)
    expect(deletedUser).toBeUndefined()
  })
})
