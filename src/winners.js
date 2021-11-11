import React, { useState, useEffect } from "react";
import { Box, CircularProgress, useMediaQuery } from "@mui/material";
import { makeStyles } from "@mui/styles";
import SimpleBar from "simplebar-react";
import loadingLogo from "./assets/jammin.gif";
import logo from "./assets/contestlogo.png";
import client from "./client";
import { Bracket } from "react-brackets";
import CustomSeed from "./CustomSeed";
import Footer from "./utils/Footer";

export default function Winners(props) {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [matches, setMatches] = useState(undefined);
  const [submissions, setSubmissions] = useState(undefined);
  const [contest, setContest] = useState(undefined);
  const [rounds, setRounds] = useState(null);
  const [bracketLoading, setBracketLoading] = useState(true);
  const contestId = props.match.params.contestId;

  useEffect(() => {
    document.title = `Contest ${contestId} - Poke`;
    const fetchSubmissions = async () => {
      await client
        .service("submissions")
        .find({
          query: {
            contest_id: contestId,
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
            contest_id: contestId,
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

  if (props.user === undefined)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <div style={{ textAlign: "center" }}>
          <div>
            <img alt="" src={loadingLogo} height="auto" width="75%" />
          </div>
          <CircularProgress style={{ marginTop: "2rem" }} size="2rem" />
        </div>
      </Box>
    );

  if (!matches || !rounds) return null;

  return (
    <SimpleBar className={classes.parent}>
      <div className={isMobile ? classes.mobileContainer : classes.container}>
        <div className={classes.box}>
          <div className={classes.inner}>
            <Box display="block" textAlign="center">
              <img src={logo} className={classes.banner} alt="" />
              <Box marginTop="3rem">
                <Box marginTop="3rem">
                  {bracketLoading ? (
                    <CircularProgress style={{ marginTop: "2rem" }} size="2rem" />
                  ) : (
                    <Bracket
                      rounds={rounds}
                      renderSeedComponent={(props) => {
                        return <CustomSeed {...props} public={true} classes={classes} contest={contest} matches={matches} setMatches={setMatches} />;
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Footer />
            </Box>
          </div>
        </div>
      </div>
    </SimpleBar>
  );
}

const useStyles = makeStyles(() => ({
  parent: {
    height: "calc(100% - 5rem)",
  },
  banner: {
    maxHeight: "300px",
  },
  container: {
    paddingRight: "25rem",
    paddingLeft: "25rem",
    marginTop: "2rem",
  },
  mobileContainer: {
    paddingRight: "1rem",
    paddingLeft: "1rem",
  },
  box: {
    backgroundColor: "#1d1d1d",
    borderLeft: "1px solid hsla(0,0%,100%,.1)",
    borderRight: "1px solid hsla(0,0%,100%,.1)",
    borderTop: "1px solid hsla(0,0%,100%,.1)",
    borderBottom: "1px solid hsla(0,0%,100%,.1)",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    marginBottom: "3rem",
    paddingBottom: "1.5rem",
  },
  inner: {
    padding: "1rem",
    flexGrow: 1,
    position: "relative",
  },
  title: {
    color: "rgb(255, 255, 255)",
    fontFamily: "Anton",
    textTransform: "uppercase",
    fontWeight: "550",
  },
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
