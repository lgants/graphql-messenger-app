import React from 'react';
import MessageList from './MessageList';
import ChannelPreview from './ChannelPreview';
import NotFound from './NotFound';

import {
    gql,
    graphql,
} from 'react-apollo';

const ChannelDetails = () => {
  let messages = [{id:'1', text:"Stub Message - To Replace"}];
  let name = "Stub Name";
  let channel = {name, messages};

  return (
    <div>
      <div className="channelName">
        {channel.name}
      </div>
      <MessageList messages={channel.messages}/>
    </div>);
}

export default (ChannelDetails);
