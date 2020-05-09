import { schema } from 'nexus'

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.phone()
    t.model.firstName()
    t.model.lastName()
    t.model.password()
    t.model.avatarUrl()
    t.model.roles()
    t.model.activationCode()
    t.model.isActivated()
  },
})

schema.queryType({
  definition(t) {
    t.crud.user()
    t.crud.users()

    t.field('logIn', {
      type: 'User',
      args: {
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
      },
      async resolve(_, { email, password }, { db }) {
        return await db.user.findMany({
          first: 1,
          where: { email, password },
        })
      },
    })
  },
})

schema.mutationType({
  definition(t) {
    t.crud.createOneUser()
    t.crud.updateOneUser()
    t.crud.updateManyUser()
    t.crud.upsertOneUser()
    t.crud.deleteOneUser()
    t.crud.deleteManyUser()
  },
})
