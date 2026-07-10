import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Frontpage from './Frontpage';
import Navbar from './navbar/navbar';
import type { ContestUser } from './types/contests';
import ErrorBoundary from './utils/ErrorBoundary';
import Loading from './utils/Loading';
import Vods from './vods/Vods';
import ChaptersLibrary from './library/ChaptersLibrary';
import NotFound from './utils/NotFound';
import '@op-archives/vod-components/index.css';
import { YoutubeVod, CustomVod, Games } from '@op-archives/vod-components';
import { requestAuth, client } from './contests/client';
import { useState, useEffect } from 'react';
import Contests from './contests/Contests';
import Manage from './contests/Manage';
import Winners from './contests/Winners';

const channel = import.meta.env.VITE_CHANNEL;
const logo = '/loading.gif';
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = Number(import.meta.env.VITE_DEFAULT_DELAY);
const twitchId = Number(import.meta.env.VITE_TWITCH_ID);

function Layout() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto flex min-h-0 w-full flex-1 flex-col max-w-full">
        <Outlet />
      </main>
    </>
  );
}

function AppLayout() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Frontpage />} />
        <Route path="/vods" element={<Vods />} />
        <Route path="/library" element={<ChaptersLibrary />} />
        <Route path="/contests" element={<ContestLayout />}>
          <Route index element={<ContestsWrapper />} />
        </Route>
        <Route path="/contests/:contestId/manage" element={<ManageWrapper />} />
        <Route path="/contests/:contestId/winners" element={<Winners />} />
        <Route path="*" element={<NotFound channel={channel} />} />
      </Route>

      <Route
        path="/vods/:vodId"
        element={
          <YoutubeVod
            type="vod"
            logo={logo}
            origin={origin}
            channel={channel}
            archiveApiBase={archiveApiBase}
            defaultDelay={defaultDelay}
            twitchId={twitchId}
          />
        }
      />
      <Route
        path="/live/:vodId"
        element={
          <YoutubeVod
            type="live"
            logo={logo}
            origin={origin}
            channel={channel}
            archiveApiBase={archiveApiBase}
            defaultDelay={defaultDelay}
            twitchId={twitchId}
          />
        }
      />
      <Route
        path="/youtube/:vodId"
        element={
          <YoutubeVod
            logo={logo}
            origin={origin}
            channel={channel}
            archiveApiBase={archiveApiBase}
            defaultDelay={defaultDelay}
            twitchId={twitchId}
          />
        }
      />
      <Route
        path="/games/:vodId"
        element={
          <Games channel={channel} logo={logo} origin={origin} archiveApiBase={archiveApiBase} twitchId={twitchId} />
        }
      />
      <Route
        path="/manual/:vodId"
        element={
          <CustomVod
            type="manual"
            logo={logo}
            channel={channel}
            archiveApiBase={archiveApiBase}
            twitchId={twitchId}
          />
        }
      />
    </Routes>
  );
}

function ContestLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

function ContestsWrapper() {
  const [user, setUser] = useState<ContestUser | null | undefined>(undefined);

  useEffect(() => {
    requestAuth()
      .then((res) => {
        if ((res as { user?: ContestUser }).user) {
          setUser((res as { user: ContestUser }).user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error('Auth failed:', err);
        setUser(null);
      });

    const onAuth = (paramUser: { user: ContestUser }) => {
      setUser(paramUser.user);
    };
    const onLogout = () => {
      setUser(null);
      window.location.href = '/';
    };

    client.on('authenticated', onAuth);
    client.on('logout', onLogout);

    return () => {
      client.off('authenticated', onAuth);
      client.off('logout', onLogout);
    };
  }, []);

  if (user === undefined) return <Loading />;
  return <Contests user={user} channel={channel} />;
}

function ManageWrapper() {
  const [user, setUser] = useState<ContestUser | null | undefined>(undefined);

  useEffect(() => {
    requestAuth()
      .then((res) => {
        if ((res as { user?: ContestUser }).user) {
          setUser((res as { user: ContestUser }).user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error('Auth failed:', err);
        setUser(null);
      });

    const onAuth = (paramUser: { user: ContestUser }) => {
      setUser(paramUser.user);
    };
    const onLogout = () => {
      setUser(null);
      window.location.href = '/';
    };

    client.on('authenticated', onAuth);
    client.on('logout', onLogout);

    return () => {
      client.off('authenticated', onAuth);
      client.off('logout', onLogout);
    };
  }, []);

  if (user === undefined) return <Loading />;
  return <Manage user={user ?? null} channel={channel} />;
}

export default function App() {
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-dark">
      <BrowserRouter>
        <ErrorBoundary channel={channel}>
          <div className="flex min-h-0 flex-1 flex-col">
            <AppLayout />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}
