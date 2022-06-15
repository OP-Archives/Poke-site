import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import SimpleBar from "simplebar-react";
import logo from "../assets/contestlogo.png";
import client from "../client";
import { Bracket } from "react-brackets";
import CustomSeed from "./CustomSeed";
import Footer from "../utils/Footer";
import { useParams } from "react-router-dom";
import Loading from "../utils/Loading";

export default function Winners() {
  const params = useParams();
  const [matches, setMatches] = useState(undefined);
  const [submissions, setSubmissions] = useState(undefined);
  const [contest, setContest] = useState(undefined);
  const [rounds, setRounds] = useState(null);
  const contestId = params.contestId;

  useEffect(() => {
    document.title = `Contest ${contestId} Winners - Poke`;
    const fetchSubmissions = async () => {
      await client
        .service("submissions")
        .find({
          query: {
            contestId: contestId,
          },
        })
        .then((data) => {
          const filteredSubmissions = data.filter((submission) => submission.winner);
          setSubmissions(filteredSubmissions);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const fetchContest = async () => {
      await client
        .service("contests")
        .get(contestId)
        .then((data) => {
          setContest(data);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const fetchMatches = async () => {
      await client
        .service("matches")
        .find({
          query: {
            contestId: contestId,
            $sort: {
              id: 1,
            },
          },
        })
        .then((data) => {
          setMatches(data);
        })
        .catch(() => {
          setMatches(undefined);
        });
    };
    fetchContest();
    fetchMatches();
    fetchSubmissions();
    return;
  }, [contestId]);

  useEffect(() => {
    if (!matches || !submissions) return;

    const getSubmission = (id) => {
      let data;
      for (let submission of submissions) {
        if (parseInt(submission.id) === id || parseInt(submission.userId) === id) {
          data = submission;
          break;
        }
      }
      return data;
    };

    let maxRounds = 0,
      tmpRounds = [];

    for (let match of matches) {
      if (parseInt(match.round) > maxRounds) maxRounds = match.round;
    }

    for (let i = 1; i <= maxRounds; i++) {
      let seeds = [];
      matches.forEach((match) => {
        if (parseInt(match.round) !== i) return;
        const nextMatch = match.challonge_match_id
          ? matches[matches.findIndex((matchArg) => matchArg.previous_a_match === match.challonge_match_id || matchArg.previous_b_match === match.challonge_match_id)]
          : null;
        const isTeamA = nextMatch?.previous_a_match === match.challonge_match_id;
        const pairedMatch =
          matches[matches.findIndex((matchArg) => (isTeamA ? matchArg.challonge_match_id === nextMatch?.previous_b_match : matchArg.challonge_match_id === nextMatch?.previous_a_match))];
        const team_a = getSubmission(match.team_a_id);
        const team_b = getSubmission(match.team_b_id);

        seeds.push({
          teams: [
            {
              id: team_a ? team_a.id : null,
              name: team_a ? team_a.display_name : null,
              submission: team_a ? team_a : null,
            },
            {
              id: team_b ? team_b.id : null,
              name: team_b ? team_b.display_name : null,
              submission: team_b ? team_b : null,
            },
          ],
          winner: match.winner_id,
          match: match,
          nextMatch: nextMatch,
          isTeamA: isTeamA,
          pairedMatch: pairedMatch,
          useOldVersion: match.challonge_match_id === null,
        });
      });
      tmpRounds.push({
        seeds: seeds,
      });
    }

    setRounds(tmpRounds);
  }, [matches, submissions]);

  if (!matches || !rounds || !contest) return <Loading />;

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", p: 1 }}>
        <img src={logo} alt="" />
        <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Bracket
            rounds={rounds}
            renderSeedComponent={(props) => {
              return <CustomSeed {...props} public={true} contest={contest} matches={matches} setMatches={setMatches} />;
            }}
          />
        </Box>
        <Footer />
      </Box>
    </SimpleBar>
  );
}
