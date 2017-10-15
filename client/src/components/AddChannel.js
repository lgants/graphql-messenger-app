import React from 'react';
import { gql, graphql } from 'react-apollo';

import { channelsListQuery } from './ChannelsListWithData';

// the graphql HOC passes down a mutate prop to execute mutations
const AddChannel = ({ mutate }) => {
  const handleKeyUp = (evt) => {
    // Apollo Client accepts a refetchQueries option on the call to perform a refetch after mutation completes (i.e. refetchQueries: [ { query: channelsListQuery }],)
    // for mutations and other cases to update the store based on an action on the client, Apollo provides tools to perform imperative store updates: readQuery,writeQuery, readFragment and writeFragment
    // Apollo Client provides access to those functions via the update property exposed in mutate
    if (evt.keyCode === 13) {
      // evt.persist();
      mutate({
        variables: { name: evt.target.value },
        optimisticResponse: {
          addChannel: {
            name: evt.target.value,
            id: Math.round(Math.random() * -1000000),
            __typename: 'Channel',
          },
        },
        update: (proxy, { data: { addChannel } }) => {
          // options.update enables store updates based on a mutation’s result
          // ApolloClient will automatically update all overlapping nodes in the store; however, options.update can be used to update the cache in a way that's dependent on the data currently in the cache
          // options.update first arg is an instance of a DataProxy object with methods to interact with the data in your store, second arg is response from the mutation - either optimistic response, or actual response returned by server
          // readQuery reads data from the cache for this query starting at the root query type
          // readQuery is similar to query, but it will never send a request using the network interface; it will only try to read from the cache, and if that read fails then an error will be thrown
          const data = proxy.readQuery({ query: channelsListQuery });
          // add channel from the mutation to the end
          data.channels.push(addChannel);
          // write the data back to the cache
          proxy.writeQuery({ query: channelsListQuery, data });
          // Apollo Client now provides the ability to control the store with four methods: readQuery(options), readFragment(options), writeQuery(options), and writeFragment(options)
          // readFragment accepts a GraphQL fragment and an id and returns the data at that id matching the provided fragment
          // writeQuery() and writeFragment() update the data in the local cache (i.e. simulate an update from the server); however, updates are not actually persisted to the backend
        },
      })
      // .then( res => {
      //   evt.target.value = '';
      // });
      evt.target.value = '';
    }
  };

  return (
    <input
      type="text"
      placeholder="New channel"
      onKeyUp={handleKeyUp}
    />
  );
};

const addChannelMutation = gql`
  mutation addChannel($name: String!) {
    addChannel(name: $name) {
      id
      name
    }
  }
`;


const AddChannelWithMutation = graphql(
  addChannelMutation,
)(AddChannel);

export default AddChannelWithMutation;
