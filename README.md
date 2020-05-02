# Do Nothing App

The "Do Nothing App" doesn't quite do nothing. But it doesn't do much. It:

- Registers new users
- Uploads Avatars to a specified S3 bucket
- Sends activation codes to new users (via the browser instead of an email)
- Activates new users in the DB via the activation code
- Logs users in
- Stores user sessions in the DB via the API (so that users don't have to login every time they refresh their browser)
- Logs users out (destroying the user session)
- Lets users change their profile settings
- Lets users delete their account

Use this repo as a baseline to create your next big app. The annoying bits of app development boilerplate listed above are taken care of for you. The rest is up to you.
