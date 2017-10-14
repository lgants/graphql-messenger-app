export const typeDefs = `

type Channel {
  id: ID!
  name: String
}

type Query {
  channels: [Channel]
}
`;
// Query type specifies the entry points into the API; in this case there is only one - "channels" - which returns a list of channels
