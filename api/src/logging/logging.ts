import { Elysia } from 'elysia'

export default new Elysia()
  .onTransform(({ body, params, path, request: { method } }) => {
    console.info(`${method} ${path}`, {
      body,
      params,
    })
  })
  .as('plugin')
