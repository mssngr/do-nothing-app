import { describe, expect, it } from 'bun:test'
import { app, testResponse } from './main'

describe('Elysia', () => {
  it('returns a test response', async () => {
    const response = await app
      .handle(new Request('http://localhost:3000/'))
      .then(res => res.text())
    expect(response).toBe(testResponse)
  })
})
