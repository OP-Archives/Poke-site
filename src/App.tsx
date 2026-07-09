import { lazy, Suspense, useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import { requestAuth, client } from './contests/client';
import { chaptersLoader } from './library/ChaptersLibrary';
import Navbar from './navbar/navbar';
import type { ContestUser } from './types/contests';
import { getVod } from './utils/archive-client';
import ErrorBoundary from './utils/ErrorBoundary';
import Loading from './utils/Loading';
import { queryClient } from './utils/queryClient';
import { vodsLoader } from './vods/Vods';

const Frontpage = lazy(() => import('./Frontpage'));
const Vods = lazy(() => import('./vods/Vods'));
const Contests = lazy(() => import('./contests/Contests'));
const Manage = lazy(() => import('./contests/Manage'));
const Winners = lazy(() => import('./contests/Winners'));
const ChaptersLibrary = lazy(() => import('./library/ChaptersLibrary'));
const NotFound = lazy(() => import('./utils/NotFound'));

const YoutubeVod = lazy(() =>
  Promise.all([import('@op-archives/vod-components'), import('@op-archives/vod-components/index.css')]).then((m) => ({
    default: m[0].YoutubeVod,
  }))
);
const CustomVod = lazy(() =>
  Promise.all([import('@op-archives/vod-components'), import('@op-archives/vod-components/index.css')]).then((m) => ({
    default: m[0].CustomVod,
  }))
);
const Games = lazy(() =>
  Promise.all([import('@op-archives/vod-components'), import('@op-archives/vod-components/index.css')]).then((m) => ({
    default: m[0].Games,
  }))
);

const channel = import.meta.env.VITE_CHANNEL;
const logo = '/loading.gif';
const origin = import.meta.env.VITE_DOMAIN || window.location.origin;
const archiveApiBase = import.meta.env.VITE_ARCHIVE_API_BASE;
const defaultDelay = Number(import.meta.env.VITE_DEFAULT_DELAY);
const twitchId = Number(import.meta.env.VITE_TWITCH_ID);

const videoLoader = async ({ params, request }: LoaderFunctionArgs) => {
  if (params.vodId) {
    queryClient.prefetchQuery({
      queryKey: ['vod', params.vodId],
      queryFn: () => getVod(params.vodId as string, { signal: request.signal }),
      staleTime: 5 * 60 * 1000,
    });
  }
  return null;
};

const MainLayout = () => (
  <>
    <Navbar />
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  </>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route hydrateFallbackElement={<Loading />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Frontpage />} />
        <Route path="/vods" element={<Vods />} loader={vodsLoader} />
        <Route path="/library" element={<ChaptersLibrary />} loader={chaptersLoader} />
        <Route path="/contests" element={<ContestLayout />}>
          <Route index element={<ContestsWrapper />} />
        </Route>
        <Route path="/contests/:contestId/manage" element={<ManageWrapper />} />
        <Route path="/contests/:contestId/winners" element={<Winners />} />
      </Route>
      <Route path="*" element={<NotFound channel={channel} />} />
      <Route
        path="/vods/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <YoutubeVod
              type="vod"
              logo={logo}
              origin={origin}
              channel={channel}
              archiveApiBase={archiveApiBase}
              defaultDelay={defaultDelay}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/live/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <YoutubeVod
              type="live"
              logo={logo}
              origin={origin}
              channel={channel}
              archiveApiBase={archiveApiBase}
              defaultDelay={defaultDelay}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/youtube/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <YoutubeVod
              logo={logo}
              origin={origin}
              channel={channel}
              archiveApiBase={archiveApiBase}
              defaultDelay={defaultDelay}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
      <Route
        path="/games/:vodId"
        loader={videoLoader}
        element={
          <Games channel={channel} logo={logo} origin={origin} archiveApiBase={archiveApiBase} twitchId={twitchId} />
        }
      />
      <Route
        path="/manual/:vodId"
        loader={videoLoader}
        element={
          <Suspense fallback={<Loading />}>
            <CustomVod
              type="manual"
              logo={logo}
              channel={channel}
              archiveApiBase={archiveApiBase}
              twitchId={twitchId}
            />
          </Suspense>
        }
      />
    </Route>
  ),
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipBypassRediscovery: true,
    },
  }
);

function ContestLayout() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
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
      <ErrorBoundary channel={channel}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </div>
  );
}
