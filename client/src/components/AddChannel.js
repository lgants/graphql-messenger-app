import React from 'react';
import { gql, graphql } from 'react-apollo';

import { channelsListQuery } from './ChannelsListWithData';

// the graphql HOC passes down a mutate prop to execute mutations
const AddChannel = ({ mutate }) => {
  const handleKeyUp = (evt) => {
    // Apollo Client accepts a refetchQueries option on the call to perform a refetch after mutation completes
    if (evt.keyCode === 13) {
      evt.persist();
      mutate({
        variables: { name: evt.target.value },
        refetchQueries: [ { query: channelsListQuery }],
      })
      .then( res => {
        evt.target.value = '';
      });
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
