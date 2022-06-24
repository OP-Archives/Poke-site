import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, styled } from "@mui/material";
import { green } from "@mui/material/colors";
import Loading from "./utils/Loading";
import client from "./client";

const Frontpage = lazy(() => import("./frontpage"));
const Vods = lazy(() => import("./vods/Vods"));
const Navbar = lazy(() => import("./navbar/navbar"));
const Contests = lazy(() => import("./contests/Contests"));
const Manage = lazy(() => import("./contests/manage"));
const Winners = lazy(() => import("./contests/winners"));
const YoutubeVod = lazy(() => import("./vods/YoutubeVod"));
const CustomVod = lazy(() => import("./vods/CustomVod"));
const NotFound = lazy(() => import("./utils/NotFound"));

const channel = "Pokelawls",
  twitchId = "12943173",
  VODS_API_BASE = `https://archive.overpowered.tv/${channel.toLowerCase()}`;

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
        <Parent>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route
                path="*"
                element={
                  <Parent>
                    <NotFound channel={channel} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/"
                element={
                  <Parent>
                    <Navbar />
                    <Frontpage channel={channel} VODS_API_BASE={VODS_API_BASE} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/vods"
                element={
                  <Parent>
                    <Navbar />
                    <Vods channel={channel} twitchId={twitchId} VODS_API_BASE={VODS_API_BASE} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/vods/:vodId"
                element={
                  <Parent>
                    <YoutubeVod channel={channel} twitchId={twitchId} type="vod" VODS_API_BASE={VODS_API_BASE} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/live/:vodId"
                element={
                  <Parent>
                    <YoutubeVod channel={channel} twitchId={twitchId} type="live" VODS_API_BASE={VODS_API_BASE} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/youtube/:vodId"
                element={
                  <Parent>
                    <YoutubeVod channel={channel} twitchId={twitchId} VODS_API_BASE={VODS_API_BASE} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/manual/:vodId"
                element={
                  <Parent>
                    <CustomVod channel={channel} twitchId={twitchId} type="manual" VODS_API_BASE={VODS_API_BASE} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/contests"
                element={
                  <Parent>
                    <Navbar />
                    <Contests user={user} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/contests/:contestId/manage"
                element={
                  <Parent>
                    <Navbar />
                    <Manage user={user} />
                  </Parent>
                }
              />
              <Route
                exact
                path="/contests/:contestId/winners"
                element={
                  <Parent>
                    <Navbar />
                    <Winners user={user} />
                  </Parent>
                }
              />
            </Routes>
          </Suspense>
        </Parent>
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
  display: flex;
  flex-direction: column;
`;
