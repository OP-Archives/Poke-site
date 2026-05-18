import { useMemo } from 'react';
import type { BracketRound, BracketSeed, ContestMatch, ContestSubmission } from '../types/contests';
import SeedCard from './SeedCard';

interface BracketViewerProps {
  rounds: BracketRound[];
  contestType: string;
  matches: ContestMatch[];
  setMatches: (_matches: ContestMatch[]) => void;
  isPublic?: boolean;
}

export default function BracketViewer({
  rounds,
  contestType,
  matches,
  setMatches,
  isPublic = false,
}: BracketViewerProps) {
  const SPACING = 80;

  // DFS to pre-calculate the perfect Y coordinate alignment for every match
  const { matchYMap, totalHeight } = useMemo(() => {
    const map = new Map<number | null, number>();
    let maxY = 0;

    if (!matches || matches.length === 0) return { matchYMap: map, totalHeight: 0 };

    const isParent = new Set<number>();
    matches.forEach((m) => {
      if (m.previous_a_match) isParent.add(m.previous_a_match);
      if (m.previous_b_match) isParent.add(m.previous_b_match);
    });

    const roots = matches
      .filter((m) => m.challonge_match_id && !isParent.has(m.challonge_match_id))
      .sort((a, b) => b.round - a.round);

    let currentY = SPACING / 2;

    const assignY = (match: ContestMatch): number => {
      if (map.has(match.challonge_match_id)) return map.get(match.challonge_match_id)!;

      let yA: number | null = null;
      let yB: number | null = null;

      if (match.previous_a_match) {
        const prevA = matches.find((m) => m.challonge_match_id === match.previous_a_match);
        if (prevA) yA = assignY(prevA);
      }
      if (match.previous_b_match) {
        const prevB = matches.find((m) => m.challonge_match_id === match.previous_b_match);
        if (prevB) yB = assignY(prevB);
      }

      let y = 0;
      if (yA !== null && yB !== null) {
        y = (yA + yB) / 2;
      } else if (yA !== null) {
        y = yA;
      } else if (yB !== null) {
        y = yB;
      } else {
        y = currentY;
        currentY += SPACING;
      }
      map.set(match.challonge_match_id, y);
      if (y > maxY) maxY = y;
      return y;
    };

    roots.forEach((r) => assignY(r));

    const calculatedHeight = Math.max(
      maxY + SPACING,
      rounds.length ? Math.max(...rounds.map((r) => r.seeds.length)) * SPACING : 0
    );

    return { matchYMap: map, totalHeight: calculatedHeight };
  }, [matches, rounds]);

  return (
    <div className="flex flex-row overflow-x-auto pb-4 pt-4">
      {rounds.map((round, roundIndex) => (
        <BracketRoundColumn
          key={roundIndex}
          rounds={rounds}
          round={round}
          roundIndex={roundIndex}
          totalHeight={totalHeight}
          matchYMap={matchYMap}
          contestType={contestType}
          matches={matches}
          setMatches={setMatches}
          isPublic={isPublic}
        />
      ))}
    </div>
  );
}

interface RoundColumnProps {
  rounds: BracketRound[];
  round: BracketRound;
  roundIndex: number;
  totalHeight: number;
  matchYMap: Map<number | null, number>;
  contestType: string;
  matches: ContestMatch[];
  setMatches: (_matches: ContestMatch[]) => void;
  isPublic: boolean;
}

function BracketRoundColumn({
  rounds,
  round,
  roundIndex,
  totalHeight,
  matchYMap,
  contestType,
  matches,
  setMatches,
  isPublic,
}: RoundColumnProps) {
  return (
    <div className="flex flex-col items-center relative mx-3">
      <p className="text-xs text-gray-500 uppercase mb-4">Round {roundIndex + 1}</p>
      <div style={{ height: `${totalHeight}px` }} className="relative w-40">
        {roundIndex > 0 && (
          <RoundConnectors rounds={rounds} roundIndex={roundIndex} matchYMap={matchYMap} totalHeight={totalHeight} />
        )}
        {round.seeds.map((seed, i) => {
          let yPos = 0;
          if (seed.useOldVersion) {
            yPos = (i + 0.5) * (totalHeight / Math.max(round.seeds.length, 1));
          } else {
            yPos = matchYMap.get(seed.match.challonge_match_id) ?? (i + 0.5) * 80;
          }

          return (
            <div key={i} className="absolute w-full" style={{ top: `${yPos}px`, transform: 'translateY(-50%)' }}>
              <BracketSeedWrapper
                seed={seed}
                roundIndex={roundIndex}
                contestType={contestType}
                matches={matches}
                setMatches={setMatches}
                isPublic={isPublic}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoundConnectors({
  rounds,
  roundIndex,
  matchYMap,
  totalHeight,
}: {
  rounds: BracketRound[];
  roundIndex: number;
  matchYMap: Map<number | null, number>;
  totalHeight: number;
}) {
  const currentRound = rounds[roundIndex];
  const prevRound = rounds[roundIndex - 1];
  if (!currentRound || !prevRound) return null;

  // The columns use mx-3 (12px per side), generating a total bridge gap of 24px between cards
  const gapWidth = 24;

  return (
    <>
      {currentRound.seeds.map((seed, i) => {
        let yA: number | null = null;
        let yB: number | null = null;
        let currentY = 0;

        if (seed.useOldVersion) {
          const prevAIdx = prevRoundIndex(rounds, roundIndex - 1, seed.match.previous_a_match);
          const prevBIdx = prevRoundIndex(rounds, roundIndex - 1, seed.match.previous_b_match);

          if (prevAIdx === -1 && prevBIdx === -1) return null;

          if (prevAIdx !== -1) yA = (prevAIdx + 0.5) * (totalHeight / Math.max(prevRound.seeds.length, 1));
          if (prevBIdx !== -1) yB = (prevBIdx + 0.5) * (totalHeight / Math.max(prevRound.seeds.length, 1));
          currentY = (i + 0.5) * (totalHeight / Math.max(currentRound.seeds.length, 1));
        } else {
          const matchId = seed.match.challonge_match_id;
          const prevA = seed.match.previous_a_match;
          const prevB = seed.match.previous_b_match;

          if (!prevA && !prevB) return null;

          currentY = matchYMap.get(matchId) ?? 0;
          if (prevA) yA = matchYMap.get(prevA) ?? null;
          if (prevB) yB = matchYMap.get(prevB) ?? null;
        }

        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: -gapWidth, top: 0, bottom: 0, width: gapWidth }}
          >
            {yA !== null && (
              <div className="absolute border-t border-gray-600" style={{ left: 0, top: yA, width: gapWidth / 2 }} />
            )}
            {yB !== null && (
              <div className="absolute border-t border-gray-600" style={{ left: 0, top: yB, width: gapWidth / 2 }} />
            )}
            {yA !== null && yB !== null && (
              <div
                className="absolute bg-gray-600"
                style={{
                  left: gapWidth / 2,
                  top: Math.min(yA, yB),
                  width: 1,
                  height: Math.abs(yA - yB),
                }}
              />
            )}
            {yA !== null && yB === null && (
              <div
                className="absolute bg-gray-600"
                style={{
                  left: gapWidth / 2,
                  top: Math.min(yA, currentY),
                  width: 1,
                  height: Math.abs(yA - currentY),
                }}
              />
            )}
            {yB !== null && yA === null && (
              <div
                className="absolute bg-gray-600"
                style={{
                  left: gapWidth / 2,
                  top: Math.min(yB, currentY),
                  width: 1,
                  height: Math.abs(yB - currentY),
                }}
              />
            )}
            <div
              className="absolute border-t border-gray-600"
              style={{ left: gapWidth / 2, top: currentY, width: gapWidth / 2 }}
            />
          </div>
        );
      })}
    </>
  );
}

function prevRoundIndex(rounds: BracketRound[], roundIdx: number, matchId: number | null): number {
  if (!matchId) return -1;
  const prev = rounds[roundIdx];
  if (!prev) return -1;
  return prev.seeds.findIndex((s) => s.match.challonge_match_id === matchId);
}

interface SeedWrapperProps {
  seed: BracketSeed;
  roundIndex: number;
  contestType: string;
  matches: ContestMatch[];
  setMatches: (_matches: ContestMatch[]) => void;
  isPublic: boolean;
}

function BracketSeedWrapper({ seed, contestType, matches, setMatches, isPublic }: SeedWrapperProps) {
  const teamA = seed.teams[0];
  const teamB = seed.teams[1];

  const winnerTeamA = seed.winner != null && seed.winner === (teamA?.id ?? Number(String(teamA?.submission?.userId)));
  const winnerTeamB = seed.winner != null && seed.winner === (teamB?.id ?? Number(String(teamB?.submission?.userId)));

  return (
    <div className="relative flex items-center w-full">
      <SeedCard seed={seed} contestType={contestType} matches={matches} setMatches={setMatches} isPublic={isPublic} />
      {winnerTeamA && <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />}
      {winnerTeamB && (
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
      )}
    </div>
  );
}

export function buildRounds(matches: ContestMatch[], submissions: ContestSubmission[]): BracketRound[] {
  const getSubmission = (id: number | null) => {
    if (!id) return null;
    return submissions.find((s) => Number(s.id) === id || Number(String(s.userId)) === id) ?? null;
  };

  let maxRounds = 0;
  for (const m of matches) {
    if (Number(m.round) > maxRounds) maxRounds = Number(m.round);
  }

  const tmpRounds: BracketRound[] = [];

  for (let i = 1; i <= maxRounds; i++) {
    const seeds: BracketSeed[] = [];
    matches.forEach((match) => {
      if (Number(match.round) !== i) return;

      const nextMatch = match.challonge_match_id
        ? (matches.find(
            (m) => m.previous_a_match === match.challonge_match_id || m.previous_b_match === match.challonge_match_id
          ) ?? null)
        : null;

      const isTeamA = nextMatch?.previous_a_match === match.challonge_match_id;

      const pairedMatch =
        matches.find(
          (m) =>
            (isTeamA && m.challonge_match_id === nextMatch?.previous_b_match) ||
            (!isTeamA && m.challonge_match_id === nextMatch?.previous_a_match)
        ) ?? null;

      const team_a = getSubmission(match.team_a_id);
      const team_b = getSubmission(match.team_b_id);

      seeds.push({
        teams: [
          {
            id: team_a?.id ?? null,
            name: team_a?.display_name ?? null,
            submission: team_a,
          },
          {
            id: team_b?.id ?? null,
            name: team_b?.display_name ?? null,
            submission: team_b,
          },
        ],
        winner: match.winner_id,
        match,
        nextMatch,
        isTeamA,
        pairedMatch,
        useOldVersion: match.challonge_match_id === null,
      });
    });
    tmpRounds.push({ seeds });
  }

  return tmpRounds;
}
