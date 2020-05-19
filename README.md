# Do Nothing App

## Summary

The "Do Nothing App" doesn't quite do nothing. It actually does a lot. It:

- Registers new users
- Generates temporary activation tokens for new users (it's up to you to send them in an activation email)
- Activates new users in the DB via the temporary activation token
- Logs users in
- Handles user sessions (so that users don't have to login every time they refresh their browser)
- Lets users know when they aren't activated, yet, prompting them to resend activation code
- Lets users change their profile settings (including changing their email and password)
- Lets users delete their account (deleting them from the DB)
- Logs users out (destroying their session)

It also handles some major security concerns, like:

- Securing API interactions (via JWTs)
- Blocking brute force password attacks via limiting failed password attempts to 5 before deactivating the account (requiring another activation email)
- Securely storing passwords via `bcrypt` (which utilizes "salting" and "hash stretching" methodologies) ([Further Reading](https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/), [More Further Reading](https://codahale.com/how-to-safely-store-a-password/))
- Encrypting PII (Personally Identifying Information) like names, phone numbers, and emails via AES-128
- Implements "blind indexes" for encrypted fields, like email, that need to be searchable ([Further Reading](https://itnext.io/indexing-encrypted-database-field-for-searching-e50e7bcfbd80))

Use this repo as a baseline to create your next big app. The annoying bits of app development boilerplate listed above are taken care of for you. The rest is up to you.

## Tech Stack

This is built using TypeScript, Create React App (for the client), NexusJS (for the server), and Postgres (for the database). For a more detailed breakdown, check out the READMEs for the client and server.
