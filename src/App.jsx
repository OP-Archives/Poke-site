import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Loading from './utils/Loading';
import client from './contests/client';
import ErrorBoundary from './utils/ErrorBoundary';
import Logo from './assets/jammin.gif';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';

const Frontpage = lazy(() => import('./frontpage'));
const Vods = lazy(() => import('./vods/Vods'));
const Navbar = lazy(() => import('./navbar/navbar'));
const Contests = lazy(() => import('./contests/Contests'));
const Manage = lazy(() => import('./contests/manage'));
const Winners = lazy(() => import('./contests/winners'));
const YoutubeVod = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.YoutubeVod })));
const CustomVod = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.CustomVod })));
const Games = lazy(() => import('@op-archives/vod-components').then((m) => ({ default: m.Games })));
const NotFound = lazy(() => import('./utils/NotFound'));
const Redirect = lazy(() => import('./utils/Redirect'));

const channel = import.meta.env.VITE_CHANNEL;
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = import.meta.env.VITE_DEFAULT_DELAY;
const twitchId = import.meta.env.VITE_TWITCH_ID;

export default function App() {
  const [user, setUser] = useState(undefined);

  let darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#0e0e10',
      },
      primary: {
        main: green[600],
      },
      secondary: {
        main: '#292828',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            color: 'white',
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  darkTheme = responsiveFontSizes(darkTheme);

  useEffect(() => {
    client.authenticate().catch(() => setUser(null));

    client.on('authenticated', (paramUser) => {
      setUser(paramUser.user);
    });

    client.on('logout', () => {
      setUser(null);
      window.location.href = '/';
    });

    return;
  }, [user]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Parent>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary channel={channel}>
              <Routes>
                <Route path="*" element={<NotFound channel={channel} />} />
                <Route
                  exact
                  path="/"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Frontpage />
                    </>
                  }
                />
                <Route
                  exact
                  path="/vods"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Vods />
                    </>
                  }
                />
                <Route
                  exact
                  path="/vods/:vodId"
                  element={<YoutubeVod type="vod" logo={Logo} origin={origin} channel={channel} archiveApiBase={archiveApiBase} defaultDelay={defaultDelay} twitchId={twitchId} />}
                />
                <Route
                  exact
                  path="/live/:vodId"
                  element={<YoutubeVod type="live" logo={Logo} origin={origin} channel={channel} archiveApiBase={archiveApiBase} defaultDelay={defaultDelay} twitchId={twitchId} />}
                />
                <Route
                  exact
                  path="/youtube/:vodId"
                  element={<YoutubeVod logo={Logo} origin={origin} channel={channel} archiveApiBase={archiveApiBase} defaultDelay={defaultDelay} twitchId={twitchId} />}
                />
                <Route exact path="/games/:vodId" element={<Games channel={channel} logo={Logo} origin={origin} archiveApiBase={archiveApiBase} twitchId={twitchId} />} />
                <Route exact path="/manual/:vodId" element={<CustomVod type="manual" logo={Logo} channel={channel} archiveApiBase={archiveApiBase} twitchId={twitchId} />} />
                <Route exact path="/census" element={<Redirect to="https://docs.google.com/forms/d/e/1FAIpQLSckFtM7MvCVirZLRUejvbXQrdvmIdtr-XlKg-7BJXsX8xLxjg/viewform" />} />
                <Route
                  exact
                  path="/contests"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Contests user={user} channel={channel} />
                    </>
                  }
                />
                <Route
                  exact
                  path="/contests/:contestId/manage"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Manage user={user} channel={channel} />
                    </>
                  }
                />
                <Route
                  exact
                  path="/contests/:contestId/winners"
                  element={
                    <>
                      <Navbar channel={channel} />
                      <Winners user={user} channel={channel} />
                    </>
                  }
                />
              </Routes>
            </ErrorBoundary>
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
