import { useEffect, useState } from 'react';
import type { Contest, ContestMatch, ContestSubmission } from '../types/contests';
import Loading from '../utils/Loading';
import BracketViewer, { buildRounds } from './BracketViewer';
import client from './client';

interface WinnersProps {
  allSubmissions: ContestSubmission[];
  winnerSubmissions: ContestSubmission[];
  contest: Contest;
}

export default function WinnerUI({ allSubmissions, winnerSubmissions, contest }: WinnersProps) {
  const [matches, setMatches] = useState<ContestMatch[] | undefined>(undefined);
  const [rounds, setRounds] = useState<Awaited<ReturnType<typeof buildRounds>> | null>(null);
  const [bracketLoading, setBracketLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client
      .service('matches')
      .find({ query: { contestId: contest.id, $sort: { id: 1 } } })
      .then((res: unknown) => {
        if (cancelled) return;
        const data = Array.isArray(res) ? res : ((res as { data: ContestMatch[] }).data ?? []);
        setMatches(data.length > 0 ? data : []);
        setBracketLoading(false);
      })
      .catch(() => {
        if (!cancelled) setBracketLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contest]);

  const createMatches = async () => {
    if (!matches) return;
    setBracketLoading(true);

    const authRes = await client.service('authentication').find();
    const authData = Array.isArray(authRes) ? authRes[0] : ((authRes as { data: { accessToken: string } }).data ?? {});
    const { accessToken } = authData;

    if (matches.length !== 0) {
      if (!window.confirm('This will recreate the bracket. Are you sure?')) return setBracketLoading(false);
      try {
        await client.service('matches').remove(null, { query: { contestId: contest.id } });
      } catch (e) {
        console.error(e);
      }
    }

    const sendSubmissions = winnerSubmissions.map((s) => ({
      misc: s.id,
      name: s.display_name,
    }));

    try {
      const res = await fetch(`${import.meta.env.VITE_CONTESTS_API}/v1/challonge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contest_id: contest.id,
          name: contest.title,
          participants: sendSubmissions,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setMatches(data);
        setBracketLoading(false);
      }
    } catch (e) {
      console.error(e);
      setBracketLoading(false);
    }
  };

  useEffect(() => {
    if (!matches || matches.length === 0 || !allSubmissions) return;
    setRounds(buildRounds(matches, allSubmissions));
  }, [matches, allSubmissions]);

  if (bracketLoading) return <Loading />;

  return (
    <>
      <div className="flex justify-center mt-2 flex-col items-center">
        <h4 className="text-primary uppercase font-semibold text-xl">{`${winnerSubmissions.length} Winners`}</h4>
        {winnerSubmissions.length === 0 && <p className="text-gray-400 text-sm mt-1">No winners selected yet</p>}
        {winnerSubmissions.length > 0 && (
          <button
            onClick={createMatches}
            className="bg-primary/20 border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10 transition-colors mt-1"
          >
            {(matches?.length ?? 0) === 0 ? 'Generate Bracket' : 'Regenerate Bracket'}
          </button>
        )}
      </div>
      <div className="mt-3">
        {bracketLoading && <Loading />}
        {!bracketLoading && rounds && (
          <BracketViewer rounds={rounds} contestType={contest.type} matches={matches!} setMatches={setMatches} />
        )}
      </div>
    </>
  );
}
