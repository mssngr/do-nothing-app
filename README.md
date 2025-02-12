# Do Nothing App

## Summary

What is the "Do Nothing App?" It's a template for your next mobile or web app with all the user account management boilerplate taken care of. If you fork this code over to use as the basis for your next app, you'll already be one step ahead, registering new users, logging them in, sending them activation emails, and more.

Beyond that, the rest is up to you!

## Features

### The "Do Nothing App" doesn't quite do nothing. It actually does a lot. It:

- Manages user accounts
  - Registers new users
  - Sends 2FA emails with activation links (think email verification & forgotten passwords)
  - Verifies new users' emails or resets their passwords via the temporary activation links
  - Logs users in/out of sessions
  - Lets users change their profile settings (including changing their email and password)
  - Lets users delete their account (deleting them from the DB)
- Utilizes TanStack Form for form management
- Deploys cross-platform (Web, iOS, Android) with Expo

### It also handles some major security concerns, like:

- Protecting "logged in" UI routes via user authorization
- Securing API interactions via JWTs saved in secure, HTTP-only cookies
- Requiring passwords to be at least 8 characters
- Blocking brute force password attacks via limiting failed password attempts to 5 before requiring password reset
- Securely storing passwords via `argon2` (which utilizes "salting" and "hash stretching" methodologies) ([Further Reading](https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/), [More Further Reading](https://codahale.com/how-to-safely-store-a-password/))
- Encrypting PII (Personally Identifying Information) like names, phone numbers, and emails via AES-256
- Implementing "blind indexes" for encrypted fields, like email, that need to be searchable ([Further Reading](https://itnext.io/indexing-encrypted-database-field-for-searching-e50e7bcfbd80))

### What you won't see:

CSS/styling. This is meant to to take away a lot of the boilerplate of making an app. But your app's look and feel is still up to you. Good luck!

## Tech Stack

This was built using:
- Bun
- TypeScript
- Expo (for the UI)
- ElysiaJS (for the API)
- Biome (for formatting + linting)

(For a more detailed breakdown, check out the READMEs for the client and server.)
