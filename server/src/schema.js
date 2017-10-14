import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

const typeDefs = `
type Channel {
  id: ID!
  name: String
}
type Query {
  channels: [Channel]
}
`;

 // makeExecutableSchema turns type definitions into an executable schema to which custom resolve functions can be added
 // resolve functions tell the server how to resolve each part of a query
const schema = makeExecutableSchema({ typeDefs, resolvers });
// addMockFunctionsToSchema provides mock data with randomized values
// NOTE removed after adding reducers with dummy data
// addMockFunctionsToSchema({ schema });

export { schema };
