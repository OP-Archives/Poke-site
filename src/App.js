import { Redirect, BrowserRouter, Route, Switch } from "react-router-dom";
import Frontpage from "./frontpage";
import Vods from "./vods";
import VodPlayer from "./vod_player";
import Navbar from './navbar';
import background from "./assets/background.png";
import background2 from "./assets/background2.png";

export default function () {
  const backgrounds = [background, background2];
  return (
    <div
      className="root"
      style={{
        backgroundImage: `url(${backgrounds[Math.round(Math.random())]})`,
      }}
    >
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            render={(props) => (
              <>
                <Navbar {...props} />
                <Frontpage {...props} />
              </>
            )}
          />
          <Route
            exact
            path="/vods"
            render={(props) => (
              <>
                <Navbar {...props} />
                <Vods {...props} />
              </>
            )}
          />
          <Route
            exact
            path="/vods/:vodId"
            render={(props) => (
              <>
                <VodPlayer {...props} />
              </>
            )}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
