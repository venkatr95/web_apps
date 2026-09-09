# Recipe Server API

This is a Node.js + TypeScript + Express-based REST API for managing recipe channels.

## Roles

- **Admin**: Full access
- **Creator**: Can create channels and recipes
- **User**: Can view, like, heart, and save recipes

## Endpoints

See the Postman collection for full endpoint details.

## Getting Started

```bash
npm install
npm run seed
npm run dev
```

## Packages

```
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken
npm install --save-dev typescript @types/express @types/node ts-node-dev @types/bcryptjs @types/jsonwebtoken
npm install faker
npm install --save-dev @types/faker
```
