## Tech Stack

A mono-repo written in the following tools:

- TypeScript
- MongoDB
- ExpressJS
- Nextjs
- React
- ChakraUI
- Jest
- Yarn workspaces

Project structure inspired by `Onion Architecture`

`UI` -> `routes` -> `controllers`/`middlewares` -> `services` -> `models` -> `database`

## Getting Started

1. Create a MongoDB account [here](https://www.mongodb.com/cloud/atlas/register) if you dont' have one already
2. Clone this project
3. Install dependencies buy running `yarn`
4. In `packages/server` folder, create `.env` file with following key value:

```
DB_URL=mongodb-server
SECRET=secret-key
INVITE_KEY=123456
APPHOST=http://localhost:3000
```

- `DB_URL` is your MongoDB server
- `SECRET` is the secret key to generate a token
- `INVITE_KEY` is a six digit alphanumerc code used in validating user registration
- `APPHOST` is the url assigned by Nextjs running the client

5. In `packages/client` folder, create `.env.local` file with the following key value:

```
NEXT_PUBLIC_API=http://localhost:3030/api/
```

- `NEXT_PUBLIC_API` is the url for the API located in `packages/server`

6. Run dev server: `yarn dev`

## Todo

- Forgot password feature
- Other tests
