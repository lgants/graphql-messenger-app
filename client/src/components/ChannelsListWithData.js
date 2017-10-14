import React from 'react';
import {
    gql,
    graphql,
} from 'react-apollo';

import AddChannel from './AddChannel';

const ChannelsList = ({ data: {loading, error, channels}}) => {
  if (loading) {
    return (<p>Loading ...</p>);
  }
  if (error) {
    return (<p>{error.message}</p>);
  }

  return (
    <div className="channelsList">
      <AddChannel />
      { channels.map( ch =>
        (<div key={ch.id} className={'channel ' + (ch.id < 0 ? 'optimistic' : '')}>{ch.name}</div>)
      )}
    </div>
  );
};

export const channelsListQuery = gql`
  query ChannelsListQuery {
    channels {
      id
      name
    }
  }
`;

// when wrapped with the graphql HOC, the ChannelsList component will receive a prop called data, which will contain channels when it’s available or error when there is an error
// data also contains a loading property, which is true when Apollo Client is still waiting for data to be fetched
// export default graphql(channelsListQuery)(ChannelsList);


// Apollo Client provides polling queries to transparently propagate updates to all clients (even if mutation was initiated by another client)
// Apollo will rerun the query every 5 seconds and update UI with the latest list of channels
export default graphql(channelsListQuery, {
  options: { pollInterval: 5000 },
})(ChannelsList);
