# Migration `20200510142405-refreshed-at`

This migration has been generated at 5/10/2020, 2:24:05 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP COLUMN "timeSinceLastRefresh",
ADD COLUMN "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "refreshedAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" timestamp(3)  NOT NULL ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200510141106-time-since-last-refresh..20200510142405-refreshed-at
--- datamodel.dml
+++ datamodel.dml
@@ -1,22 +1,24 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator prisma_client {
   provider = "prisma-client-js"
 }
 model User {
-  id                   Int      @default(autoincrement()) @id
-  email                String   @unique
-  phone                String
-  firstName            String
-  lastName             String
-  password             String
-  avatarUrl            String?
-  roles                String[]
-  activationCode       String?
-  isActivated          Boolean  @default(false)
-  timeSinceLastRefresh Int      @default(0)
+  id             Int      @default(autoincrement()) @id
+  email          String   @unique
+  phone          String
+  firstName      String
+  lastName       String
+  password       String
+  avatarUrl      String?
+  roles          String[]
+  activationCode String?
+  isActivated    Boolean  @default(false)
+  createdAt      DateTime @default(now())
+  updatedAt      DateTime @updatedAt
+  refreshedAt    DateTime @default(now())
 }
```


