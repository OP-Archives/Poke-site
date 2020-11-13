import { BrowserRouter, Route, Switch } from "react-router-dom";
import Frontpage from "./frontpage";
import Vods from "./vods";
import VodPlayer from "./vod_player";
import Navbar from "./navbar";
import background from "./assets/background.png";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <div
              className="root"
              style={{
                backgroundImage: `url(${background})`,
                height: "100%",
                width: "100%",
              }}
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
              className="root"
              style={{
                backgroundImage: `url(${background})`,
                height: "100%",
                width: "100%",
              }}
            >
              <Navbar {...props} />
              <Vods {...props} />
            </div>
          )}
        />
        <Route
          exact
          path="/vods/:vodId"
          render={(props) => (
            <div
              className="root"
            >
              <VodPlayer {...props} />
            </div>
          )}
        />
      </Switch>
    </BrowserRouter>
  );
}
