import express from 'express';
import {
  graphqlExpress,
  graphiqlExpress,
} from 'graphql-server-express';
import bodyParser from 'body-parser';

import { schema } from './src/schema';

const PORT = 4000;

const server = express();

// adds graphqlExpress middleware, which executes the queries against the schema, to Express
server.use('/graphql', bodyParser.json(), graphqlExpress({
  schema
}));

// adds graphqliQL middleware, which provides an interactive query editor, to Express
server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}));

server.listen(PORT, () =>
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`)
);
