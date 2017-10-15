import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

// mutations won't do anything without a resolver function
// cursors are pointers to the spot where the data was left off
const typeDefs = `
type Channel {
  id: ID!
  name: String
  messages: [Message]

  # messages will be returned in a MessageFeed object wrapper
  messageFeed(cursor: String): MessageFeed
}

input MessageInput{
  channelId: ID!
  text: String
}

type Message {
  id: ID!
  text: String
  createdAt: Int
}

type MessageFeed {
  # cursor tells the client the place in the list where last fetch left off
  cursor: String!

  # this is a chunk of messages to be returned
  messages: [Message]!
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
