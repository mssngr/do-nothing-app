# Migration `20200518232710-password-attempts`

This migration has been generated by Gabriel Konkle at 5/18/2020, 11:27:10 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "passwordAttempts" integer  NOT NULL DEFAULT 0;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200518184209-unique-email-index..20200518232710-password-attempts
--- datamodel.dml
+++ datamodel.dml
@@ -1,22 +1,23 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator prisma_client {
   provider = "prisma-client-js"
 }
 model User {
-  id          String   @default(uuid()) @id
-  email       String
-  emailIndex  String   @unique
-  phone       String
-  firstName   String
-  lastName    String
-  hash        String
-  isActivated Boolean  @default(false)
-  createdAt   DateTime @default(now())
-  updatedAt   DateTime @updatedAt
-  refreshedAt DateTime @default(now())
+  id               String   @default(uuid()) @id
+  email            String
+  emailIndex       String   @unique
+  phone            String
+  firstName        String
+  lastName         String
+  hash             String
+  passwordAttempts Int      @default(0)
+  isActivated      Boolean  @default(false)
+  createdAt        DateTime @default(now())
+  updatedAt        DateTime @updatedAt
+  refreshedAt      DateTime @default(now())
 }
```


