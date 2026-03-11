import io from 'socket.io-client';
import feathers from '@feathersjs/client';

const socket = io(import.meta.env.VITE_CONTESTS_SOCKETIO_HOST, { path: import.meta.env.VITE_CONTESTS_SOCKETIO_PATH });
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  })
);

export default client;
