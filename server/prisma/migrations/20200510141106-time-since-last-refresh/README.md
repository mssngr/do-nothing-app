# Migration `20200510141106-time-since-last-refresh`

This migration has been generated at 5/10/2020, 2:11:06 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "timeSinceLastRefresh" integer  NOT NULL DEFAULT 0;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200502105951-initialize..20200510141106-time-since-last-refresh
--- datamodel.dml
+++ datamodel.dml
@@ -1,21 +1,22 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator prisma_client {
   provider = "prisma-client-js"
 }
 model User {
-  id             Int      @default(autoincrement()) @id
-  email          String   @unique
-  phone          String
-  firstName      String
-  lastName       String
-  password       String
-  avatarUrl      String?
-  roles          String[]
-  activationCode String?
-  isActivated    Boolean  @default(false)
+  id                   Int      @default(autoincrement()) @id
+  email                String   @unique
+  phone                String
+  firstName            String
+  lastName             String
+  password             String
+  avatarUrl            String?
+  roles                String[]
+  activationCode       String?
+  isActivated          Boolean  @default(false)
+  timeSinceLastRefresh Int      @default(0)
 }
```


