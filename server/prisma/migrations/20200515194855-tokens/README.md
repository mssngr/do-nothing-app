# Migration `20200515194855-tokens`

This migration has been generated by Gabriel Konkle at 5/15/2020, 7:48:55 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "accessToken" text   ,
ADD COLUMN "refreshToken" text   ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200510142405-refreshed-at..20200515194855-tokens
--- datamodel.dml
+++ datamodel.dml
@@ -1,7 +1,7 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator prisma_client {
   provider = "prisma-client-js"
@@ -16,8 +16,10 @@
   password       String
   avatarUrl      String?
   roles          String[]
   activationCode String?
+  refreshToken   String?
+  accessToken    String?
   isActivated    Boolean  @default(false)
   createdAt      DateTime @default(now())
   updatedAt      DateTime @updatedAt
   refreshedAt    DateTime @default(now())
```


