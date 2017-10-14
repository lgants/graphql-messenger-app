import React from 'react';
import { gql, graphql } from 'react-apollo';

import { channelsListQuery } from './ChannelsListWithData';

// the graphql HOC passes down a mutate prop to execute mutations
const AddChannel = ({ mutate }) => {
  const handleKeyUp = (evt) => {
    // Apollo Client accepts a refetchQueries option on the call to perform a refetch after mutation completes (i.e. refetchQueries: [ { query: channelsListQuery }],)
    // for mutations and other cases to update the store based on an action on the client, Apollo provides tools to perform imperative store updates: readQuery,writeQuery, readFragment and writeFragment
    // Apollo Client makes provides access to those functions via the update property exposed in mutate
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
        update: (store, { data: { addChannel } }) => {
          // read data from the cache for this query
          const data = store.readQuery({ query: channelsListQuery });
          // add channel from the mutation to the end
          data.channels.push(addChannel);
          // write the data back to the cache
          store.writeQuery({ query: channelsListQuery, data });
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
