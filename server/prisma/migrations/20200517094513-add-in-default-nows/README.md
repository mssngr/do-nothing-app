# Migration `20200517094513-add-in-default-nows`

This migration has been generated by Gabriel Konkle at 5/17/2020, 9:45:13 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "refreshedAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200517094456-remove-default-nows..20200517094513-add-in-default-nows
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
@@ -19,6 +19,8 @@
   activationCode String?
   refreshToken   String?
   accessToken    String?
   isActivated    Boolean  @default(false)
+  createdAt      DateTime @default(now())
   updatedAt      DateTime @updatedAt
+  refreshedAt    DateTime @default(now())
 }
```


