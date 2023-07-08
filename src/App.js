import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, styled } from "@mui/material";
import { green } from "@mui/material/colors";
import Loading from "./utils/Loading";
import client from "./contests/client";

const Frontpage = lazy(() => import("./frontpage"));
const Vods = lazy(() => import("./vods/Vods"));
const Navbar = lazy(() => import("./navbar/navbar"));
const Contests = lazy(() => import("./contests/Contests"));
const Manage = lazy(() => import("./contests/manage"));
const Winners = lazy(() => import("./contests/winners"));
const YoutubeVod = lazy(() => import("./vods/YoutubeVod"));
const Games = lazy(() => import("./games/Games"));
const CustomVod = lazy(() => import("./vods/CustomVod"));
const NotFound = lazy(() => import("./utils/NotFound"));

const channel = process.env.REACT_APP_CHANNEL,
  twitchId = process.env.REACT_APP_TWITCH_ID,
  VODS_API_BASE = process.env.REACT_APP_VODS_API_BASE;

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
              <Route path="*" element={<NotFound channel={channel} />} />
              <Route
                exact
                path="/"
                element={
                  <>
                    <Navbar />
                    <Frontpage channel={channel} VODS_API_BASE={VODS_API_BASE} />
                  </>
                }
              />
              <Route
                exact
                path="/vods"
                element={
                  <>
                    <Navbar />
                    <Vods channel={channel} twitchId={twitchId} VODS_API_BASE={VODS_API_BASE} />
                  </>
                }
              />
              <Route exact path="/vods/:vodId" element={<YoutubeVod channel={channel} twitchId={twitchId} type="vod" VODS_API_BASE={VODS_API_BASE} />} />
              <Route exact path="/live/:vodId" element={<YoutubeVod channel={channel} twitchId={twitchId} type="live" VODS_API_BASE={VODS_API_BASE} />} />
              <Route exact path="/youtube/:vodId" element={<YoutubeVod channel={channel} twitchId={twitchId} VODS_API_BASE={VODS_API_BASE} />} />
              <Route exact path="/games/:vodId" element={<Games channel={channel} twitchId={twitchId} VODS_API_BASE={VODS_API_BASE} />} />
              <Route exact path="/manual/:vodId" element={<CustomVod channel={channel} twitchId={twitchId} type="manual" VODS_API_BASE={VODS_API_BASE} />} />
              <Route
                exact
                path="/contests"
                element={
                  <>
                    <Navbar />
                    <Contests user={user} />
                  </>
                }
              />
              <Route
                exact
                path="/contests/:contestId/manage"
                element={
                  <>
                    <Navbar />
                    <Manage user={user} />
                  </>
                }
              />
              <Route
                exact
                path="/contests/:contestId/winners"
                element={
                  <>
                    <Navbar />
                    <Winners user={user} />
                  </>
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
