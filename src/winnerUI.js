import React, { useState, useEffect } from "react";
import { Button, Box, CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import client from "./client";
import { Bracket } from "react-brackets";
import CustomSeed from "./CustomSeed";

export default function Winners(props) {
  const classes = useStyles();
  const [matches, setMatches] = useState(undefined);
  const [rounds, setRounds] = useState(null);
  const [bracketLoading, setBracketLoading] = useState(true);
  const submissions = props.submissions;
  const contest = props.contest;

  useEffect(() => {
    const fetchMatches = async () => {
      await client
        .service("matches")
        .find({
          query: {
            contest_id: contest.id,
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
    fetchMatches();
    return;
  }, [contest.id]);

  const createMatches = async (evt) => {
    if (!matches) return;
    setBracketLoading(true);
    const { accessToken } = await client.get("authentication");

    if (matches.length !== 0) {
      const confirmDialog = window.confirm("This will recreate the bracket. Are you sure?");
      if (!confirmDialog) return setBracketLoading(false);
      for (let match of matches) {
        await client
          .service("matches")
          .remove(match.id)
          .catch((e) => {
            console.error(e);
          });
      }
    }

    const sendSubmissions = [];
    for (let submission of submissions) {
      sendSubmissions.push({
        misc: submission.user_id,
        name: submission.display_name,
      });
    }

    await fetch(`https://api.poke.gg/v1/challonge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        contest_id: contest.id,
        name: contest.title,
        participants: sendSubmissions,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) return;
        setMatches(data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  useEffect(() => {
    if (!matches) return;

    const getSubmission = (id) => {
      let data;
      for (let submission of submissions) {
        if (parseInt(submission.id) === id || parseInt(submission.user_id) === id) {
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
    setBracketLoading(false);
  }, [matches, submissions]);

  if (!matches || !rounds) return null;

  return (
    <Box marginTop="3rem">
      <Button variant="outlined" onClick={createMatches} className={classes.button}>
        Create Bracket
      </Button>
      <Box marginTop="3rem">
        {bracketLoading ? (
          <CircularProgress style={{ marginTop: "2rem" }} size="2rem" />
        ) : (
          <Bracket
            rounds={rounds}
            renderSeedComponent={(props) => {
              return <CustomSeed {...props} classes={classes} contest={contest} matches={matches} setMatches={setMatches} />;
            }}
          />
        )}
      </Box>
    </Box>
  );
}

const useStyles = makeStyles(() => ({
  button: {
    color: "#fff",
    backgroundColor: "#008230",
    "&:hover": {
      backgroundColor: "#008230",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
  },
  modalContent: {
    position: "absolute",
    width: "400px",
    backgroundColor: "#1d1d1d",
    outline: "none",
  },
  modal: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
  },
  modalParent: {
    height: "100%",
    padding: "5rem",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
  winner: {
    color: "#008230",
    fontWeight: "700",
  },
  textLink: {
    color: "#fff",
    fontWeight: "700",
    "&:hover": {
      color: "#fff",
      opacity: "0.7",
      textDecoration: "none",
    },
  },
  winnerLink: {
    color: "#008230",
    fontWeight: "700",
    "&:hover": {
      color: "#008230",
      opacity: "0.7",
      textDecoration: "none",
    },
  },
}));
