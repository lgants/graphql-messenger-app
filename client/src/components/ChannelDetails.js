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
          // prev is the previous store state
          return prev;
        }

        const newMessage = subscriptionData.data.messageAdded;

        // don't double add the message
        if (!prev.channel.messageFeed.messages.find((msg) => msg.id === newMessage.id)) {
          return Object.assign({}, prev, {
            channel: Object.assign({}, prev.channel, {
              messages: [...prev.channel.messageFeed.messages, newMessage]
            })
          });
        } else {
          return prev;
        }
      }
    })
  }

  render() {
    const { data: {loading, error, channel }, match, loadOlderMessages } = this.props;

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
        <button onClick={loadOlderMessages}>
          Load Older Messages
        </button>
        <MessageList messages={channel.messageFeed.messages}/>
      </div>
    );
  }
}

// the connection directive on the messageFeed field in the query is a special client-side only directive that controls how data under that field is cached in the Apollo Client store
// the directive specifies that data returned from this field should be stored under the key messageFeed, making it easier to append to this list from the mutation for adding a new message
// without a connection directive on that field, the mutation update function would need to reproduce the exact set of arguments originally passed to that field
export const channelDetailsQuery = gql`
  query ChannelDetailsQuery($channelId: ID!, $cursor: String) {
    channel(id: $channelId) {
      id
      name
      messageFeed(cursor: $cursor) @connection(key: "messageFeed") {
        cursor
        messages {
          id
          text
        }
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
  props: (props) => {
    return {
      data: props.data,
      loadOlderMessages: () => {
        // the fetchMore function will use the original query by default (i.e. channelDetailsQuery) so just pass in new variables
        // once new data is returned from the server the Apollo Client’s updateQuery function is used to merge the new data with the existing data, which will cause a re-render of the UI component
        return props.data.fetchMore({
          variables: {
            channelId: props.data.channel.id,
            cursor: props.data.channel.messageFeed.cursor,
          },
          updateQuery(previousResult, { fetchMoreResult }) {
            const prevMessageFeed =
              previousResult.channel.messageFeed;
            const newMessageFeed =
              fetchMoreResult.channel.messageFeed;
            const newChannelData = {...previousResult.channel,
              messageFeed: {
                messages: [
                  ...newMessageFeed.messages,
                  ...prevMessageFeed.messages
                ],
                cursor: newMessageFeed.cursor
              }
            }
            const newData =  {
              ...previousResult,
              channel: newChannelData
            };
            return newData;
          }
        });
      }
    };
  }
})(ChannelDetails));
