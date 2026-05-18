import authentication from '@feathersjs/authentication-client';
import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_CONTESTS_SOCKETIO_HOST, {
  path: import.meta.env.VITE_CONTESTS_SOCKETIO_PATH,
  transports: ['websocket'],
});

const client = feathers();

client.configure(socketio(socket, { timeout: 10000 }));
client.configure(
  authentication({
    storage: window.localStorage,
  })
);

export function requestAuth(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Auth timeout'));
    }, 10000);

    const checkResult = async () => {
      try {
        const result = await client.reAuthenticate();
        clearTimeout(timeout);
        resolve(result);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    };

    if (!socket.connected) {
      socket.connect();
    }

    checkResult();
  });
}

export default client;
export { client, socket };
