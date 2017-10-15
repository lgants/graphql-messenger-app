import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

// mutations won't do anything without a resolver function
const typeDefs = `
type Channel {
  id: ID!
  name: String
  messages: [Message]!
}

input MessageInput{
  channelId: ID!
  text: String
}

type Message {
  id: ID!
  text: String
}

# query root type specifies the entry points into the API
type Query {
  channels: [Channel]
  channel(id: ID!): Channel
}

# mutation root type; used to define all mutations
type Mutation {
  addChannel(name: String!): Channel
  addMessage(message: MessageInput!): Message
}

# subscription root type
type Subscription {
  messageAdded(channelId: ID!): Message
}
`;

 // makeExecutableSchema turns type definitions into an executable schema to which custom resolve functions can be added
 // resolve functions tell the server how to resolve each part of a query
const schema = makeExecutableSchema({ typeDefs, resolvers });
// addMockFunctionsToSchema provides mock data with randomized values
// NOTE removed after adding reducers with dummy data
// addMockFunctionsToSchema({ schema });

export { schema };
