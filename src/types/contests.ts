export interface ContestUser {
  id: number;
  username: string;
  display_name: string;
  type: 'admin' | 'mod' | 'user';
  banned?: boolean;
}

export interface VideoData {
  id: string | null;
  link: string;
  source: 'youtube' | 'tiktok' | 'soundcloud' | 'twitter' | 'twitch' | null;
  start: number | null;
  end: number | null;
}

export interface ContestSubmission {
  id: number;
  contestId: number;
  userId: number;
  username: string;
  display_name: string;
  video: VideoData;
  comment: string;
  title: string;
  status: '' | 'approved' | 'denied';
  winner: boolean;
}

export interface ContestMatch {
  id: number;
  contestId: number;
  round: number;
  challonge_match_id: number | null;
  team_a_id: number | null;
  team_b_id: number | null;
  winner_id: number | null;
  previous_a_match: number | null;
  previous_b_match: number | null;
}

export interface Contest {
  id: number;
  title: string;
  active: boolean;
  submission: boolean;
  type: 'alert' | 'song' | 'review' | 'clips';
  createdAt: string;
  submissions: ContestSubmission[];
}

export interface BracketSeed {
  teams: BracketTeam[];
  winner: number | null;
  match: ContestMatch;
  nextMatch: ContestMatch | null;
  isTeamA: boolean;
  pairedMatch: ContestMatch | null;
  useOldVersion: boolean;
}

export interface BracketTeam {
  id: number | null;
  name: string | null;
  submission: ContestSubmission | null;
}

export interface BracketRound {
  seeds: BracketSeed[];
}
