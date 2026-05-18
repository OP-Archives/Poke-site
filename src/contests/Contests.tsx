import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import type { Contest, ContestUser } from '../types/contests';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import { useMediaQuery } from '../utils/useMediaQuery';
import client from './client';
import IsolatedModal from './IsolatedModal';

dayjs.extend(localizedFormat);

const OAUTH_LOGIN = `${import.meta.env.VITE_CONTESTS_API}/oauth/twitch?redirect=contests`;

interface ContestsProps {
  user: ContestUser | null;
  channel: string;
}

export default function Contests({ user, channel }: ContestsProps) {
  const isMobile = useMediaQuery('(max-width: 800px)');
  const [contests, setContests] = useState<Contest[] | undefined>(undefined);

  useEffect(() => {
    document.title = `Contests - ${channel}`;
    client
      .service('contests')
      .find({ query: { $sort: { createdAt: -1 } } })
      .then((res: unknown) => {
        setContests(
          (Array.isArray(res) ? res : ((res as { data: Contest[] }).data ?? [])).sort(
            (a, b) => Number(b.active) - Number(a.active)
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setContests([]);
      });
  }, [channel]);

  if (user === undefined || contests === undefined) return <Loading />;

  const isAdmin = user && (user.type === 'admin' || user.type === 'mod');

  return (
    <SimpleBar className="min-h-0 h-full w-full">
      <div className="flex justify-center items-center mt-1 flex-col w-full">
        <div className="p-2 md:p-4 w-full">
          <div className="w-full flex justify-center items-center flex-col">
            <div className={`mt-2 ${isMobile ? 'w-full' : 'w-1/2'}`}>
              <div className="bg-dark-light border border-gray-700 rounded p-4">
                <div className="flex items-center justify-center flex-col">
                  <img src="/loading.gif" alt="" className="h-auto max-w-[120px]" />
                  <div className="mt-1 flex items-center justify-center flex-col">
                    <h3 className="text-primary font-semibold text-2xl uppercase">{`${channel} Contests`}</h3>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {!user && (
                      <a
                        href={OAUTH_LOGIN}
                        className="bg-primary/20 border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors flex items-center gap-2"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                        </svg>
                        Connect
                      </a>
                    )}
                    {isAdmin && <IsolatedModal type="Creation" user={user} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 md:p-4 w-full">
          <div className="flex flex-col">
            <div className="w-full flex justify-center items-center flex-col">
              <div className={`mt-2 ${isMobile ? 'w-full' : 'w-1/2'}`}>
                {contests.map((data) => (
                  <div
                    key={data.id}
                    className="bg-dark-light border border-gray-700 rounded p-4 mt-2 flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-400">Status: </p>
                        <p className={`text-sm ${data.active ? 'text-red-400' : 'text-gray-400'}`}>
                          {data.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400">{dayjs(data.createdAt).format('LL')}</p>
                      <h6 className="text-primary uppercase font-semibold">{`${data.type} Contest`}</h6>
                      <h5 className="uppercase mt-2">{data.title}</h5>
                      <h6 className="text-primary uppercase font-semibold mt-2">
                        {`${data.submissions.length} Submissions`}
                      </h6>
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-1`}>
                      {isAdmin && (
                        <>
                          <div className="p-1">
                            <a
                              href={`/contests/${data.id}/manage`}
                              className="bg-red-900/40 border border-red-600 text-red-300 px-3 py-1.5 rounded hover:bg-red-900/60 transition-colors inline-block"
                            >
                              Manage
                            </a>
                          </div>
                          <div className="p-1">
                            <IsolatedModal type="Edit" user={user} contest={data} />
                          </div>
                        </>
                      )}
                      <div className="p-1">
                        <IsolatedModal type="Submit" user={user} contest={data} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </SimpleBar>
  );
}
