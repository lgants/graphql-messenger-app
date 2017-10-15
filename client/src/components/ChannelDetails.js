import React, { Component } from 'react';
import MessageList from './MessageList';
import ChannelPreview from './ChannelPreview';
import NotFound from './NotFound';

import {
    gql,
    graphql,
} from 'react-apollo';

class ChannelDetails extends Component {
  componentWillMount() {
    // use Apollo Client’s subscribeToMore function to make the subscription request; it updates the store when new data is recieved
    // the updateQuery function produces a new instance of a store state based on prev, the previous store state
    // use the Object.assign method to create a copy of the store with modifications to add the new message
    this.props.data.subscribeToMore({
      document: messagesSubscription,
      variables: {
        channelId: this.props.match.params.channelId,
      },
      updateQuery: (prev, {subscriptionData}) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage = subscriptionData.data.messageAdded;

        // don't double add the message
        if (!prev.channel.messages.find((msg) => msg.id === newMessage.id)) {
          return Object.assign({}, prev, {
            channel: Object.assign({}, prev.channel, {
              messages: [...prev.channel.messages, newMessage]
            })
          });
        } else {
          return prev;
        }
      }
    })
  }

  render() {
    const { data: {loading, error, channel }, match } = this.props;

    if (loading) {
      return <ChannelPreview channelId={match.params.channelId}/>;
    }
    if (error) {
      return <p>{error.message}</p>;
    }
    if(channel === null){
      return <NotFound />
    }

    return (
      <div>
        <div className="channelName">
          {channel.name}
        </div>
        <MessageList messages={channel.messages}/>
      </div>
    );
  }
}

export const channelDetailsQuery = gql`
  query ChannelDetailsQuery($channelId : ID!) {
    channel(id: $channelId) {
      id
      name
      messages {
        id
        text
      }
    }
  }
`;

const messagesSubscription = gql`
  subscription messageAdded($channelId: ID!) {
    messageAdded(channelId: $channelId) {
      id
      text
    }
  }
`

// graphql function takes two arguments: query and config (config is optional object with configuration)
export default (graphql(channelDetailsQuery, {
  options: (props) => ({
    variables: { channelId: props.match.params.channelId },
  }),
})(ChannelDetails));
