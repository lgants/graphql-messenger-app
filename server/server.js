import express from 'express';
import {
  graphqlExpress,
  graphiqlExpress,
} from 'graphql-server-express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { schema } from './src/schema';

import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const PORT = 4000;

const server = express();
server.use('*', cors({ origin: 'http://localhost:3000' }));

// adds graphqlExpress middleware, which executes the queries against the schema, to Express
server.use('/graphql', bodyParser.json(), graphqlExpress({
  schema
}));

// adds graphqliQL middleware, which provides an interactive query editor, to Express
// subscriptionsEndpoint configures GraphiQL to use the subscriptions WebSocket
server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:4000/subscriptions`
}));

// wrap the express server to attach the WebSocket for subscriptions
const ws = createServer(server);

ws.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`);

  // set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  },
  {
    server: ws,
    path: '/subscriptions',
  });
});
