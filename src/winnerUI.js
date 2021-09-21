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
  console.log(submissions.length);
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

  const shuffleArray = (array) => {
    let tmp_array = [...array];
    for (let i = tmp_array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tmp_array[i], tmp_array[j]] = [tmp_array[j], tmp_array[i]];
    }
    return tmp_array;
  };

  const createMatches = async (evt) => {
    if (!matches) return;
    setBracketLoading(true);

    const shuffledArray = shuffleArray(submissions);

    if (matches.length !== 0) {
      const confirmDialog = window.confirm("This will recreate the bracket. Are you sure?");
      if (!confirmDialog) return;
      for (let match of matches) {
        await client
          .service("matches")
          .remove(match.id)
          .catch((e) => {
            console.error(e);
          });
      }
    }

    const isPowerOf2 = (num) => {
      return (Math.log(num) / Math.log(2)) % 1 === 0;
    };

    //round up to nearest power of 2
    const pow2ceil = (num) => {
      let p = 2;
      while ((num >>= 1)) {
        p <<= 1;
      }
      return p;
    };

    let round = 1,
      tmpMatches = [],
      roundedSubmissions = isPowerOf2(submissions.length) ? submissions.length : pow2ceil(submissions.length);

    for (let x = roundedSubmissions; x > 1; x -= x / 2) {
      if (round === 1) {
        for (let i = 0; i < x; i += 2) {
          let currentSubmission = shuffledArray[i];
          if (!currentSubmission) {
            await client
              .service("matches")
              .create({
                contest_id: contest.id,
                team_a_id: -1,
                team_b_id: -1,
                round: round,
              })
              .then((data) => {
                tmpMatches.push(data);
              })
              .catch((e) => {
                console.error(e);
              });
            continue;
          }
          let nextSubmission = shuffledArray[i + 1];
          if (!nextSubmission) {
            await client
              .service("matches")
              .create({
                contest_id: contest.id,
                team_a_id: currentSubmission.id,
                team_b_id: -1,
                winner_id: currentSubmission.id,
                round: round,
              })
              .then((data) => {
                tmpMatches.push(data);
              })
              .catch((e) => {
                console.error(e);
              });
            continue;
          }
          await client
            .service("matches")
            .create({
              contest_id: contest.id,
              team_a_id: currentSubmission.id,
              team_b_id: nextSubmission.id,
              round: round,
            })
            .then((data) => {
              tmpMatches.push(data);
            })
            .catch((e) => {
              console.error(e);
            });
        }
      } else {
        for (let i = 0; i < x; i += 2) {
          await client
            .service("matches")
            .create({
              contest_id: contest.id,
              team_a_id: -1,
              team_b_id: -1,
              round: round,
            })
            .then((data) => {
              tmpMatches.push(data);
            })
            .catch((e) => {
              console.error(e);
            });
        }
      }
      round++;
    }

    setMatches(tmpMatches);
  };

  useEffect(() => {
    if (!matches) return;

    const getSubmission = (id) => {
      let data;
      for (let submission of submissions) {
        if (parseInt(submission.id) !== id) continue;
        data = submission;
      }
      return data;
    };

    let maxRounds = 0,
      tmpRounds = [];

    for (let match of matches) {
      if (match.round > maxRounds) maxRounds = match.round;
    }

    for (let i = 1; i <= maxRounds; i++) {
      let seeds = [];
      for (let match of matches) {
        if (parseInt(match.round) !== i) continue;
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
        });
      }
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
