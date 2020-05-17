# Do Nothing App

## Summary

The "Do Nothing App" doesn't quite do nothing. It actually does a lot. It:

- Registers new users
- Generates activation codes for new users (it's up to you to send them in an activation email)
- Activates new users in the DB via the activation code
- Logs users in
- Handles user sessions (so that users don't have to login every time they refresh their browser)
- Lets users change their profile settings (including changing their email and password)
- Lets users delete their account (deleting them from the DB)
- Logs users out (destroying their session)

It also handles some major security concerns, like:

- Securing API interactions (via JWTs)
- Securely storing passwords (via "salting" and "hashing")
- Encrypting PII (Personally Identifying Information) like names, phone numbers, emails, etc... (via SHA-256)

Use this repo as a baseline to create your next big app. The annoying bits of app development boilerplate listed above are taken care of for you. The rest is up to you.

## Tech Stack

This is built using TypeScript, Create React App (for the client), NexusJS (for the server), and Postgres (for the database). For a more detailed breakdown, check out the READMEs for the client and server.
