import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import faker from 'faker';

// const channels = [{
//   id: '1',
//   name: 'soccer',
//   messages: [{
//     id: '1',
//     text: 'soccer is football',
//   }, {
//     id: '2',
//     text: 'hello soccer world cup',
//   }]
// }];

const channels = [];
let lastChannelId = 0;
let lastMessageId = 0;
let messageCreatedAt = 123456789;

function addChannel(name) {
  lastChannelId++;
  const newChannel = {
    id: String(lastChannelId),
    name: name,
    messages: [],
  };
  channels.push(newChannel);
  return lastChannelId;
}

function getChannel(id) {
  return channels.find(channel => channel.id === id);
}

function addFakeMessage(channel, messageText) {
  lastMessageId++;
  messageCreatedAt++;
  const newMessage = {
    id: lastMessageId,
    createdAt: messageCreatedAt,
    text: messageText,
  };
  channel.messages.push(newMessage);
}

// use faker to generate random messages in faker channel
addChannel('faker');
const fakerChannel = channels.find(channel => channel.name === 'faker');

// Add seed for consistent random data
faker.seed(9);
for (let i = 0; i < 50; i++) {
  addFakeMessage(fakerChannel, faker.random.words());
}

// generate second channel for initial channel list view
addChannel('channel2');

const pubsub = new PubSub();

// NOTE every resolver in a GraphQL.js schema accepts four positional arguments: fieldName(obj, args, context, info) { result }
// NOTE obj the previous object, which for a field on the root Query type is often not used, args is an object with the arguments passed into the field in the query, context a value which is provided to every resolver and holds important contextual information like the currently logged in user, or access to a database
// NOTE resolvers aren't required for every type in a schema; if a resolver isn't specified, GraphQL.js falls back to a default one, which returns a property from obj with the relevant field name, or calls a function on obj with the relevant field name and passes the query arguments into that function
// NOTE so a resolver isn't needed if the relevent Model object retrieved from the backend already contained the fields specified in the graphql query
// need to define a resolve function for each field that either returns a non-scalar type or takes any arguments
export const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },
    channel: (root, { id }) => {
      return getChannel(id);
    },
  },
  // Channel added for pagination
  Channel: {
    messageFeed: (channel, { cursor }) => {
      // the cursor passed in by the client will be an integer timestamp
      // if no cursor is passed in, set the cursor equal to the time at which the last message in the channel was created
      if (!cursor) {
        cursor = channel.messages[channel.messages.length - 1].createdAt;
      }

      cursor = parseInt(cursor);
      // limit is the number of messages to return
      // could pass it in as an argument but in this case it's a static value
      const limit = 10;

      // find index of message created at time held in cursor
      const newestMessageIndex = channel.messages.findIndex(
        message => message.createdAt === cursor
      );

      // need to return a new cursor to the client so that it can find the next page
      // set newCursor to createdAt time of the last message in this messageFeed
      const newCursor =
        channel.messages[newestMessageIndex - limit].createdAt;

      const messageFeed = {
        messages: channel.messages.slice(
          newestMessageIndex - limit,
          newestMessageIndex
        ),
        cursor: newCursor,
      };

      return messageFeed;
    },
  },
  Mutation: {
    addChannel: (root, args) => {
      const name = args.name;
      const id = addChannel(name);
      return getChannel(id);
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(
        channel => channel.id === message.channelId
      );
      if (!channel) throw new Error('Channel does not exist');

      const newMessage = {
        id: String(lastMessageId++),
        text: message.text,
        createdAt: +new Date(),
      };
      channel.messages.push(newMessage);

      pubsub.publish('messageAdded', {
        messageAdded: newMessage,
        channelId: message.channelId,
      });

      return newMessage;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
        // `messageAdded` channel includes events for all channels, so use filter to only pass through events for the channel specified in the query
        return payload.channelId === variables.channelId;
      }),
    }
  },
};
