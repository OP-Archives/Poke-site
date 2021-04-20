import { BrowserRouter, Route, Switch } from "react-router-dom";
import Frontpage from "./frontpage";
import Vods from "./vods";
import VodPlayer from "./vod_player";
import Navbar from "./navbar";

export default function App() {
  const channel = "poke", twitchId = "12943173";;
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <div
              className="root background"
            >
              <Navbar {...props} />
              <Frontpage {...props} />
            </div>
          )}
        />
        <Route
          exact
          path="/vods"
          render={(props) => (
            <div
              className="root background"
            >
              <Navbar {...props} />
              <Vods {...props} channel={channel} twitchId={twitchId} />
            </div>
          )}
        />
        <Route
          exact
          path="/vods/:vodId"
          render={(props) => (
            <div className="root">
              <VodPlayer {...props} channel={channel} twitchId={twitchId} />
            </div>
          )}
        />
      </Switch>
    </BrowserRouter>
  );
}
