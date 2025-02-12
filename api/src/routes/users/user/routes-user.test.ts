import { describe, expect, it } from 'bun:test'
import dbUsers from '@/db/users'
import { app } from '@/main'

describe('GET /users/:id', () => {
  it('gets an individual user', async () => {
    const user = await app
      .handle(new Request('http://localhost:3000/users/abc'))
      .then(res => res.json())
    expect(user.givenName).toBe('Gabriel')
  })

  it('returns 404 for an unknown user', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/users/wrong-id'),
    )
    expect(response.status).toBe(404)
  })
})

describe('POST /users/:id', () => {
  it('updates an individual user', async () => {
    await app.handle(
      new Request('http://localhost:3000/users/abc', {
        method: 'POST',
        body: JSON.stringify({ givenName: 'Gabriela' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const user = await app
      .handle(new Request('http://localhost:3000/users/abc'))
      .then(res => res.json())
    expect(user.givenName).toBe('Gabriela')

    // Cleanup
    dbUsers.updateUser('abc', { givenName: 'Gabriel' })
  })

  it('returns 404 for an unknown user', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/users/wrong-id', {
        method: 'POST',
        body: JSON.stringify({ givenName: 'Gabriela' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(response.status).toBe(404)
  })
})
