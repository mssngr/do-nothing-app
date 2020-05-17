# Do Nothing API

The Do Nothing API provides all the database interactions necessary to manage users in an application. But, that's all it does. If you want to manage posts or products or add relationships between users, get to writing! The data model can be edited in the `/prisma/schema.prisma` file. The GraphQL API can be modified in the `/api/graphql.ts` file.

## Changing the Data Model

When you change the data model, you'll need to migrate your database. You can do this manually with SQL, or, you can use the experimental "Prisma Migrate" functionality with the following command:

```
yarn migrate
```

## Changing the API

When you change the GraphQL API, you'll need to update the `nexus` client. To do this, run the dev server while making your changes:

```
yarn dev
```

## Technologies

This API utilizes the following technologies:

- Nexus JS
- Prisma 2
- TypeScript
- Yarn
- Prettier
- SHA-256
