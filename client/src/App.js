import React, { Component } from 'react';
import './App.css';
import ChannelsListWithData from './components/ChannelsListWithData';

import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
} from 'react-apollo';

import {
  makeExecutableSchema,
  addMockFunctionsToSchema
} from 'graphql-tools';

import { typeDefs } from './schema';

const schema = makeExecutableSchema({ typeDefs });
addMockFunctionsToSchema({ schema });

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:4000/graphql',
});

// Apollo Client assumes it’s running on the same origin under /graphql if a URL for the GraphQL endpoint isn't specified
const client = new ApolloClient({
  networkInterface,
});

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <div className="navbar">React + GraphQL Tutorial</div>
          <ChannelsListWithData />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
