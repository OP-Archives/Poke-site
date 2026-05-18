import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import logo from '../assets/contestlogo.png';
import type { Contest, ContestSubmission, ContestUser } from '../types/contests';
import CustomLink from '../utils/CustomLink';
import { debounce } from '../utils/debounce';
import Footer from '../utils/Footer';
import { toHHMMSS } from '../utils/helpers';
import Loading from '../utils/Loading';
import Redirect from '../utils/Redirect';
import { useMediaQuery } from '../utils/useMediaQuery';
import client from './client';
import TikTokPlayer from './TikTokPlayer';
import WinnerUI from './WinnerUI';
import YoutubePlayer from './YoutubePlayer';

type UiFilter = 'all' | 'denied' | 'unapproved' | 'approved' | 'winners';

interface ManageProps {
  user: ContestUser | null;
  channel: string;
}

export default function Manage({ user }: ManageProps) {
  const params = useParams();
  const contestId = params.contestId as string;
  const isMobile = useMediaQuery('(max-width: 800px)');
  const [contest, setContest] = useState<Contest | undefined>(undefined);
  const [allSubmissions, setAllSubmissions] = useState<ContestSubmission[] | undefined>(undefined);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContestSubmission[] | undefined>(undefined);
  const [submission, setSubmission] = useState<ContestSubmission | undefined>(undefined);
  const [ui, setUi] = useState<UiFilter>('all');

  useEffect(() => {
    document.title = `Contest ${contestId} - Poke`;
    client
      .service('contests')
      .get(contestId)
      .then((data: Contest) => setContest(data))
      .catch(() => setContest(null as unknown as Contest));

    client
      .service('submissions')
      .find({ query: { contestId, $sort: { id: 1 } } })
      .then((res: unknown) => {
        const all = Array.isArray(res) ? res : ((res as { data: ContestSubmission[] }).data ?? []);
        setAllSubmissions(all);
        setFilteredSubmissions(all);
      })
      .catch(console.error);
  }, [contestId]);

  useEffect(() => {
    if (!allSubmissions) return;
    let filtered: ContestSubmission[] = allSubmissions;
    switch (ui) {
      case 'denied':
        filtered = allSubmissions.filter((s) => s.status === 'denied');
        break;
      case 'unapproved':
        filtered = allSubmissions.filter((s) => s.status === '');
        break;
      case 'approved':
        filtered = allSubmissions.filter((s) => s.status === 'approved');
        break;
      case 'winners':
        filtered = allSubmissions.filter((s) => s.winner);
        break;
    }
    setFilteredSubmissions(filtered);
  }, [ui, allSubmissions]);

  useEffect(() => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) return;
    setSubmission(filteredSubmissions[0]);
  }, [filteredSubmissions]);

  const updateSubmissionInList = (updated: ContestSubmission) => {
    if (!allSubmissions) return;
    const idx = allSubmissions.findIndex((s) => s.id === updated.id);
    if (idx !== -1) {
      const copy = [...allSubmissions];
      copy[idx] = updated;
      setAllSubmissions(copy);
    }
  };

  const nextSubmission = () => {
    if (!submission || !filteredSubmissions) return;
    const idx = filteredSubmissions.findIndex((s) => s.id === submission.id) + 1;
    if (filteredSubmissions[idx]) setSubmission(filteredSubmissions[idx]);
  };

  const prevSubmission = () => {
    if (!submission || !filteredSubmissions) return;
    const idx = filteredSubmissions.findIndex((s) => s.id === submission.id) - 1;
    if (filteredSubmissions[idx]) setSubmission(filteredSubmissions[idx]);
  };

  const approve = async () => {
    if (!submission) return;
    try {
      const data = await client.service('submissions').patch(submission.id, { status: 'approved' });
      updateSubmissionInList(data as ContestSubmission);
    } catch (e) {
      console.error(e);
    }
  };

  const unapprove = async () => {
    if (!submission || !window.confirm('Are you sure?')) return;
    try {
      const data = await client.service('submissions').patch(submission.id, { status: '' });
      updateSubmissionInList(data as ContestSubmission);
    } catch (e) {
      console.error(e);
    }
  };

  const deny = async () => {
    if (!submission) return;
    try {
      const data = await client.service('submissions').patch(submission.id, { status: 'denied' });
      updateSubmissionInList(data as ContestSubmission);
    } catch (e) {
      console.error(e);
    }
  };

  const switchWinner = async () => {
    if (!submission || submission.status !== 'approved') return;
    try {
      const data = await client.service('submissions').patch(submission.id, { winner: !submission.winner });
      updateSubmissionInList(data as ContestSubmission);
      if (ui === 'winners') {
        const filtered = allSubmissions!.filter((s) => s.winner);
        setFilteredSubmissions(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ban = async () => {
    if (!submission || !window.confirm('Are you sure?')) return;
    try {
      await client.service('users').patch(submission.userId, { banned: true });
    } catch (e) {
      console.error(e);
    }
    try {
      const data = await client.service('submissions').patch(submission.id, { status: 'denied' });
      updateSubmissionInList(data as ContestSubmission);
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async () => {
    if (!submission || !window.confirm('Are you sure?')) return;
    try {
      await client.service('submissions').remove(submission.id);
      if (!allSubmissions) return;
      const idx = allSubmissions.findIndex((s) => s.id === submission.id);
      const updated = allSubmissions.filter((s) => s.id !== submission.id);
      setAllSubmissions(updated);
      if (updated.length === 0) return setSubmission(undefined);
      const nextIdx = Math.min(idx, updated.length - 1);
      setSubmission(updated[nextIdx]);
    } catch (e) {
      console.error(e);
    }
  };

  const submissionIdDebounce = useMemo(
    () =>
      debounce((val: unknown) => {
        if (!filteredSubmissions || typeof val !== 'string' || val.length === 0) return;
        const value = Number(val);
        if (isNaN(value) || value < 0) return;
        const found = filteredSubmissions.find((s) => s.id === value);
        if (found) setSubmission(found);
      }, 600),
    [filteredSubmissions]
  );

  const indexDebounce = useMemo(
    () =>
      debounce((val: unknown) => {
        if (!filteredSubmissions || typeof val !== 'string' || val.length === 0) return;
        const value = Number(val) - 1;
        if (isNaN(value) || value < 0 || !filteredSubmissions[value]) return;
        setSubmission(filteredSubmissions[value]);
      }, 600),
    [filteredSubmissions]
  );

  if (user === undefined || contest === undefined) return <Loading />;
  if (!contest) return <Redirect to="/contests" />;
  if (!user) return <Redirect to="/contests" />;
  if (user.type !== 'mod' && user.type !== 'admin') return <Redirect to="/contests" />;

  const currentIndex =
    filteredSubmissions && submission ? filteredSubmissions.findIndex((s) => s.id === submission.id) + 1 : undefined;

  const contestData = contest ?? null;

  return (
    <SimpleBar className="min-h-0 h-full w-full">
      <div className="flex justify-center w-full mt-2 mb-2">
        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-3/4'}`}>
          <div className="bg-dark-light border border-gray-700 rounded px-6 py-2">
            <div className="flex justify-center items-center flex-col">
              <img src={logo} alt="" className="h-auto max-w-[150px]" />
              <div className={`flex mt-2 ${isMobile ? 'flex-col' : 'flex-row'} gap-1`}>
                {(['all', 'denied', 'unapproved', 'approved', 'winners'] as UiFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setUi(f)}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      ui === f
                        ? 'bg-primary/30 border border-primary text-primary'
                        : 'bg-dark-light border border-gray-600 text-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col w-full mt-2">
                {filteredSubmissions === undefined && <Loading />}
                {filteredSubmissions && submission && ui !== 'winners' && (
                  <>
                    <div className="flex justify-center items-center flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold">Submission ID:</p>
                        <input
                          key={submission.id}
                          type="text"
                          defaultValue={submission.id}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => submissionIdDebounce(e.target.value)}
                          className="bg-dark border border-gray-600 rounded px-2 py-1 text-sm text-center text-white w-[80px]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold">Status:</p>
                        <p
                          className={`text-sm uppercase ${
                            submission.status === 'approved'
                              ? 'text-primary'
                              : submission.status === ''
                                ? 'text-gray-400'
                                : 'text-red-400'
                          }`}
                        >
                          {submission.status === '' ? 'Not Approved' : submission.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          key={currentIndex}
                          type="text"
                          defaultValue={currentIndex}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => indexDebounce(e.target.value)}
                          className="bg-dark border border-gray-600 rounded px-2 py-1 text-sm text-center text-white w-[50px]"
                        />
                        <p className="text-sm">/ {filteredSubmissions.length}</p>
                      </div>
                    </div>

                    <div className="flex justify-center items-center gap-1 mt-1">
                      <NavButton
                        onClick={() => filteredSubmissions[0] && setSubmission(filteredSubmissions[0])}
                        icon="⏮"
                      />
                      <NavButton onClick={prevSubmission} icon="◀" />
                      <NavButton onClick={nextSubmission} icon="▶" />
                      <NavButton
                        onClick={() =>
                          filteredSubmissions[filteredSubmissions.length - 1] &&
                          setSubmission(filteredSubmissions[filteredSubmissions.length - 1])
                        }
                        icon="⏭"
                      />
                    </div>

                    <div
                      className={`flex w-full justify-evenly items-center ${isMobile ? 'flex-col' : 'flex-row'} mt-2`}
                    >
                      {contestData && <VideoEmbed contest={contestData} submission={submission} isMobile={isMobile} />}
                    </div>
                  </>
                )}
              </div>

              {filteredSubmissions && submission && ui !== 'winners' && (
                <div className={`flex justify-center items-center flex-col mt-2 ${isMobile ? 'w-full' : 'w-[60%]'}`}>
                  <h5 className="text-lg">{submission.title}</h5>
                  <h5 className="text-primary font-semibold">{submission.display_name}</h5>
                  <CustomLink href={submission.video.link} target="_blank" rel="noreferrer noopener">
                    <p className="text-xs text-gray-400 truncate max-w-[300px] hover:underline cursor-pointer">
                      {submission.video.link}
                    </p>
                  </CustomLink>
                  {submission.video.start != null && submission.video.end != null && (
                    <h5 className="text-lg">
                      {`${toHHMMSS(submission.video.start)} - ${toHHMMSS(submission.video.end)}`}
                    </h5>
                  )}
                  <p className="text-sm text-gray-400 break-words max-w-full">{submission.comment}</p>

                  <div className="flex items-center gap-1 mt-2">
                    {submission.status === 'denied' && <ActionButton onClick={unapprove}>Un-Deny</ActionButton>}
                    {submission.status === 'approved' && (
                      <>
                        <ActionButton onClick={unapprove} color="red">
                          Un-Approve
                        </ActionButton>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={submission.winner}
                            onChange={switchWinner}
                            className="accent-primary"
                          />
                          <span className="text-sm font-semibold">Winner</span>
                        </label>
                      </>
                    )}
                    {submission.status === '' && (
                      <>
                        <ActionButton onClick={approve}>Approve</ActionButton>
                        <ActionButton onClick={deny} color="red">
                          Deny
                        </ActionButton>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <ActionButton onClick={remove} color="red">
                      Remove
                    </ActionButton>
                    <ActionButton onClick={ban} color="red">
                      Ban User
                    </ActionButton>
                  </div>
                </div>
              )}

              {allSubmissions && ui === 'winners' && contestData && (
                <WinnerUI
                  contest={contestData}
                  winnerSubmissions={allSubmissions.filter((s) => s.winner)}
                  allSubmissions={allSubmissions}
                />
              )}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </SimpleBar>
  );
}

function NavButton({ onClick, icon }: { onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className="border border-gray-600 text-primary px-2 py-1 rounded hover:border-primary/50 transition-colors"
    >
      {icon}
    </button>
  );
}

function ActionButton({
  onClick,
  color = 'primary',
  children,
}: {
  onClick: () => void;
  color?: 'primary' | 'red';
  children: React.ReactNode;
}) {
  const cls =
    color === 'red'
      ? 'border-red-600 text-red-300 hover:bg-red-900/40'
      : 'border-primary text-primary hover:bg-primary/10';
  return (
    <button onClick={onClick} className={`border px-3 py-1.5 rounded transition-colors ${cls}`}>
      {children}
    </button>
  );
}

function VideoEmbed({
  contest,
  submission,
  isMobile,
}: {
  contest: Contest;
  submission: ContestSubmission;
  isMobile: boolean;
}) {
  const widthClass = isMobile ? 'w-full' : 'w-[60%]';

  if (contest.type === 'alert' && (submission.video.source === 'youtube' || !submission.video.source)) {
    return (
      <div className={`h-full ${widthClass}`}>
        <YoutubePlayer submission={submission} />
      </div>
    );
  }
  if (contest.type === 'alert' && submission.video.source === 'tiktok') {
    return (
      <div className={`h-full ${isMobile ? 'w-full' : 'w-[22%]'}`}>
        <TikTokPlayer submission={submission} />
      </div>
    );
  }
  if (contest.type === 'clips') {
    return (
      <div className={`h-full ${widthClass}`}>
        <iframe
          title={submission.video.id ?? ''}
          src={`https://clips.twitch.tv/embed?clip=${submission.video.id}&parent=${window.location.hostname}`}
          height="500px"
          width="100%"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    );
  }
  if (contest.type === 'review') {
    return (
      <div className={`h-full ${widthClass}`}>
        <iframe
          title="Tweet"
          src={`https://platform.twitter.com/embed/Tweet.html?id=${submission.video.id}`}
          width="550"
          height="600"
          frameBorder="0"
        />
      </div>
    );
  }
  if (contest.type === 'song') {
    return (
      <div className={`h-full ${widthClass}`}>
        <iframe
          title="SoundCloud Player"
          width="100%"
          height="160"
          scrolling="no"
          frameBorder="0"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${submission.video.link.replace(/(www\.|m\.)/, '')}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
        />
      </div>
    );
  }
  return null;
}
