# Migration `20200517154725-ids-as-strings`

This migration has been generated by Gabriel Konkle at 5/17/2020, 3:47:25 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP TABLE "public"."User";

CREATE TABLE "public"."User" (
    "accessToken" text   ,
    "activationCode" text   ,
    "avatarUrl" text   ,
    "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" text  NOT NULL ,
    "firstName" text  NOT NULL ,
    "id" text  NOT NULL ,
    "isActivated" boolean  NOT NULL DEFAULT false,
    "lastName" text  NOT NULL ,
    "password" text  NOT NULL ,
    "phone" text  NOT NULL ,
    "refreshToken" text   ,
    "refreshedAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roles" text []  ,
    "updatedAt" timestamp(3)  NOT NULL ,
    PRIMARY KEY ("id")
) 

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200517094513-add-in-default-nows..20200517154725-ids-as-strings
--- datamodel.dml
+++ datamodel.dml
@@ -1,15 +1,15 @@
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
+  id             String   @default(uuid()) @id
   email          String   @unique
   phone          String
   firstName      String
   lastName       String
```


