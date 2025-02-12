import { describe, expect, it } from 'bun:test'
import dbUsers from '@/db/users'
import { app } from '@/main'

describe('GET /users', () => {
  it('gets all users', async () => {
    const users = await app
      .handle(new Request('http://localhost:3000/users'))
      .then(res => res.json())
    expect(users.length).toBe(1)
  })

  it('filters users', async () => {
    const frankUsers = await app
      .handle(new Request('http://localhost:3000/users?givenName=Frank'))
      .then(res => res.json())
    const gabrielUsers = await app
      .handle(new Request('http://localhost:3000/users?givenName=Gabriel'))
      .then(res => res.json())
    expect(frankUsers.length).toBe(0)
    expect(gabrielUsers.length).toBe(1)
  })
})

describe('POST /users', () => {
  it('creates users', async () => {
    const { id } = await app
      .handle(
        new Request('http://localhost:3000/users', {
          method: 'POST',
          body: JSON.stringify({
            givenName: 'Lex',
            familyName: 'Luthor',
            email: 'notjeffbezos@amazon.com',
            password: 'totallysafepassword',
          }),
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .then(res => res.json())
    const newUser = await app
      .handle(new Request(`http://localhost:3000/users/${id}`))
      .then(res => res.json())
    expect(newUser.givenName).toBe('Lex')

    // Cleanup
    dbUsers.deleteUser(id)
  })
})
