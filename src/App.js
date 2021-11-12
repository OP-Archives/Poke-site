import { BrowserRouter, Route, Switch } from "react-router-dom";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, styled } from "@mui/material";
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

const channel = "pokelawls",
  twitchId = "12943173";

export default function App() {
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
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            color: "white",
            backgroundImage: "none",
          },
        },
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
              <Parent>
                <Navbar {...props} />
                <Frontpage channel={channel} {...props} />
              </Parent>
            )}
          />
          <Route
            exact
            path="/vods"
            render={(props) => (
              <Parent>
                <Navbar {...props} />
                <Vods {...props} channel={channel} twitchId={twitchId} />
              </Parent>
            )}
          />
          <Route
            exact
            path="/vods/:vodId"
            render={(props) => (
              <Parent>
                <VodPlayer {...props} channel={channel} type={"vod"} twitchId={twitchId} />
              </Parent>
            )}
          />
          <Route
            exact
            path="/live/:vodId"
            render={(props) => (
              <Parent>
                <VodPlayer {...props} channel={channel} type={"live"} twitchId={twitchId} />
              </Parent>
            )}
          />
          <Route
            exact
            path="/contest"
            render={(props) => (
              <Parent>
                <Navbar {...props} />
                <Contest {...props} user={user} />
              </Parent>
            )}
          />
          <Route
            exact
            path="/contest/:contestId/manage"
            render={(props) => (
              <Parent>
                <Navbar {...props} />
                <Manage {...props} user={user} />
              </Parent>
            )}
          />
          <Route
            exact
            path="/contest/:contestId/winners"
            render={(props) => (
              <Parent>
                <Navbar {...props} />
                <Winners {...props} user={user} />
              </Parent>
            )}
          />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const Parent = styled((props) => <div {...props} />)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
`;
