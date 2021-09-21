import { BrowserRouter, Route, Switch } from "react-router-dom";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { green } from "@mui/material/colors";
import Frontpage from "./frontpage";
import Vods from "./vods";
import VodPlayer from "./vod_player";
import Navbar from "./navbar";
import Contest from "./contest";
import Manage from "./manage";
import Winners from "./winners";
import client from "./client";
import { useState, useEffect } from "react";

export default function App() {
  const channel = "pokelawls",
    twitchId = "12943173";
  const [user, setUser] = useState(undefined);

  let darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#0e0e10",
      },
      primary: {
        main: green[600],
      },
      secondary: {
        main: "#292828",
      },
    },
  });

  darkTheme = responsiveFontSizes(darkTheme);

  useEffect(() => {
    client.authenticate().catch(() => setUser(null));

    client.on("authenticated", (paramUser) => {
      setUser(paramUser.user);
    });

    client.on("logout", () => {
      setUser(null);
      window.location.href = "/";
    });

    return;
  }, [user]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            render={(props) => (
              <div className="root background">
                <Navbar {...props} />
                <Frontpage channel={channel} {...props} />
              </div>
            )}
          />
          <Route
            exact
            path="/vods"
            render={(props) => (
              <div className="root background">
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
                <VodPlayer {...props} channel={channel} type={"vod"} twitchId={twitchId} />
              </div>
            )}
          />
          <Route
            exact
            path="/live/:vodId"
            render={(props) => (
              <div className="root">
                <VodPlayer {...props} channel={channel} type={"live"} twitchId={twitchId} />
              </div>
            )}
          />
          <Route
            exact
            path="/contest"
            render={(props) => (
              <div className="root">
                <Navbar {...props} />
                <Contest {...props} user={user} />
              </div>
            )}
          />
          <Route
            exact
            path="/contest/:contestId/manage"
            render={(props) => (
              <div className="root">
                <Navbar {...props} />
                <Manage {...props} user={user} />
              </div>
            )}
          />
          <Route
            exact
            path="/contest/:contestId/winners"
            render={(props) => (
              <div className="root">
                <Navbar {...props} />
                <Winners {...props} user={user} />
              </div>
            )}
          />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}
