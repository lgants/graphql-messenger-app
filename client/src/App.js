import React, { Component } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
} from 'react-router-dom';

import './App.css';
import ChannelsListWithData from './components/ChannelsListWithData';
import NotFound from './components/NotFound';
import ChannelDetails from './components/ChannelDetails';

import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
  toIdValue,
} from 'react-apollo';

// import {
//   makeExecutableSchema,
//   addMockFunctionsToSchema
// } from 'graphql-tools';

// import { typeDefs } from './schema';

// const schema = makeExecutableSchema({ typeDefs });
// addMockFunctionsToSchema({ schema });

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:4000/graphql',
});
// simulates latency of 500ms
networkInterface.use([{
  applyMiddleware(req, next) {
    setTimeout(next, 500);
  },
}]);

function dataIdFromObject (result) {
  if (result.__typename) {
    if (result.id !== undefined) {
      return `${result.__typename}:${result.id}`;
    }
  }
  return null;
}

// ApolloClient assumes it’s running on the same origin under /graphql if a URL for the GraphQL endpoint isn't specified
// custom resolver tells Apollo Client to check its cache for a Channel object with ID $channelId whenever a channel query is made (i.e. need to tell it that the channel query might resolve to an object that was retrieved by a channels query)
// ApolloClient uses dataIdFromObject to tag GraphQL objects in the cache and toIdValue ensures an ID type is returned
const client = new ApolloClient({
  networkInterface,
  customResolvers: {
    Query: {
      channel: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'Channel', id: args['id'] }))
      },
    },
  },
  dataIdFromObject,
});

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <div className="App">
            <Link to="/" className="navbar">React + GraphQL Tutorial</Link>
            <Switch>
              <Route exact path="/" component={ChannelsListWithData}/>
              <Route path="/channel/:channelId" component={ChannelDetails}/>
              <Route component={ NotFound }/>
            </Switch>
          </div>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}

export default App;
