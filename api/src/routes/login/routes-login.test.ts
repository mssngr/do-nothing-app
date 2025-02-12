import { describe, expect, it } from 'bun:test'
import { app } from '@/main'

describe('POST /login', () => {
  it('logs in successfully', async () => {
    const user = await app
      .handle(
        new Request('http://localhost:3000/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'fake@email.com',
            password: 'p4ssw0rd!',
          }),
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .then(res => res.json())
    expect(user.givenName).toBe('Gabriel')
  })

  it('returns 401 for an invalid password', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'fake@email.com',
          password: 'wrong-password',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(response.status).toBe(401)
  })

  it('returns 401 for an unknown user', async () => {
    const response = await app.handle(
      new Request('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'p4ssw0rd!',
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(response.status).toBe(401)
  })
})
