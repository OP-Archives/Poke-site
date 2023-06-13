import io from "socket.io-client";
import feathers from "@feathersjs/client";

const socket = io("https://api.poke.gg");
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  })
);

export default client;
