import React, { useState, useEffect, useRef } from "react";
import { Typography, Button, Box, CircularProgress, useMediaQuery, Switch, Link } from "@mui/material";
import { makeStyles } from "@mui/styles";
import SimpleBar from "simplebar-react";
import loadingLogo from "../assets/jammin.gif";
import logo from "../assets/contestlogo.png";
import Youtube from "react-youtube";
import client from "../client";
import WinnerUI from "./winnerUI";
import { Tweet } from "react-twitter-widgets";
import Footer from "../utils/Footer";
import Redirect from "../utils/Redirect";
import { useParams } from "react-router-dom";

export default function Manage(props) {
  const params = useParams();
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [player, setPlayer] = useState(undefined);
  const [submissions, setSubmissions] = useState(undefined);
  const [currentSubmission, setCurrentSubmission] = useState(undefined);
  const [submissionUI, setSubmissionUI] = useState(false);
  const [unapprovedUI, setUnapprovedUI] = useState(false);
  const [approvedUI, setApprovedUI] = useState(false);
  const [deniedUI, setDeniedUI] = useState(false);
  const [winnerUI, setWinnerUI] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(undefined);
  const [contestExists, setContestExists] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [contest, setContest] = useState(null);
  const [submissionIdInput, setSubmissionIdInput] = useState(null);
  const contestId = params.contestId;
  const idTimeout = useRef(null);
  const arrayTimeout = useRef(null);

  useEffect(() => {
    document.title = `Contest ${contestId} - Poke`;
    const fetchContest = async () => {
      await client
        .service("contests")
        .get(contestId)
        .then((data) => {
          setContestExists(true);
          setContest(data);
        })
        .catch(() => {
          setContestExists(false);
        });
    };
    fetchContest();
    return;
  }, [contestId]);

  const fetchSubmissions = async () => {
    let res = [];
    await client
      .service("submissions")
      .find({
        query: {
          contest_id: contestId,
          $sort: {
            id: 1,
          },
        },
      })
      .then((data) => {
        res = data;
      })
      .catch((e) => {
        console.error(e);
      });
    return res;
  };

  const cueVideo = (id, start, end, argPlayer = false) => {
    if (!player) {
      if (start !== null && end !== null)
        return argPlayer.cueVideoById({
          videoId: id,
          startSeconds: start,
          endSeconds: end,
        });

      if (start !== null && end === null)
        return argPlayer.cueVideoById({
          videoId: id,
          startSeconds: start,
        });

      if (start === null && end !== null)
        return argPlayer.cueVideoById({
          videoId: id,
          endSeconds: end,
        });

      return argPlayer.cueVideoById(id);
    }

    if (start !== null && end !== null)
      return player.cueVideoById({
        videoId: id,
        startSeconds: start,
        endSeconds: end,
      });

    if (start !== null && end === null)
      return player.cueVideoById({
        videoId: id,
        startSeconds: start,
      });

    if (start === null && end !== null)
      return player.cueVideoById({
        videoId: id,
        endSeconds: end,
      });

    player.cueVideoById(id);
  };

  const showSubmissions = async (evt) => {
    const tmp_submissions = await fetchSubmissions();
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(false);
    setUnapprovedUI(false);
    setSubmissionUI(true);
    setApprovedUI(false);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player) cueVideo(tmp_submissions[0].video.id, tmp_submissions[0].video.start, tmp_submissions[0].video.end);
  };

  const showUnapprovedSubmissions = async (evt) => {
    let tmp_submissions = await fetchSubmissions();
    tmp_submissions = tmp_submissions.filter((submission) => submission.status === "");
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(false);
    setUnapprovedUI(true);
    setSubmissionUI(false);
    setApprovedUI(false);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player) cueVideo(tmp_submissions[0].video.id, tmp_submissions[0].video.start, tmp_submissions[0].video.end);
  };

  const showApprovedSubmissions = async (evt) => {
    let tmp_submissions = await fetchSubmissions();
    tmp_submissions = tmp_submissions.filter((submission) => submission.status === "approved");
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(false);
    setUnapprovedUI(false);
    setSubmissionUI(false);
    setApprovedUI(true);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player) cueVideo(tmp_submissions[0].video.id, tmp_submissions[0].video.start, tmp_submissions[0].video.end);
  };

  const showDeniedVideos = async (evt) => {
    let tmp_submissions = await fetchSubmissions();
    tmp_submissions = tmp_submissions.filter((submission) => submission.status === "denied");
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(true);
    setUnapprovedUI(false);
    setSubmissionUI(false);
    setApprovedUI(false);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player) cueVideo(tmp_submissions[0].video.id, tmp_submissions[0].video.start, tmp_submissions[0].video.end);
  };

  const showWinnersSubmissions = async (evt) => {
    let tmp_submissions = await fetchSubmissions(true);
    tmp_submissions = tmp_submissions.filter((submission) => submission.winner);
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(false);
    setUnapprovedUI(false);
    setSubmissionUI(false);
    setApprovedUI(false);
    setWinnerUI(true);
    if (tmp_submissions.length > 0 && player) cueVideo(tmp_submissions[0].video.id, tmp_submissions[0].video.start, tmp_submissions[0].video.end);
  };

  const onReady = (evt) => {
    const argPlayer = evt.target;
    setPlayer(argPlayer);
    if (currentSubmission) cueVideo(currentSubmission.video.id, currentSubmission.video.start, currentSubmission.video.end, argPlayer);
  };

  const handleApproval = async (evt) => {
    await client
      .service("submissions")
      .patch(currentSubmission.id, {
        status: "approved",
      })
      .then((data) => {
        submissions[currentIndex] = data;
        setSubmissions(submissions);
        setCurrentSubmission(data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleUnApproval = async (evt) => {
    await client
      .service("submissions")
      .patch(currentSubmission.id, {
        status: "",
      })
      .then((data) => {
        submissions[currentIndex] = data;
        setSubmissions(submissions);
        setCurrentSubmission(data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleDeny = async (evt) => {
    await client
      .service("submissions")
      .patch(currentSubmission.id, {
        status: "denied",
      })
      .then((data) => {
        submissions[currentIndex] = data;
        setSubmissions(submissions);
        setCurrentSubmission(data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleWinnerChange = async (evt) => {
    if (currentSubmission.status !== "approved") return;
    await client
      .service("submissions")
      .patch(currentSubmission.id, {
        winner: !currentSubmission.winner,
      })
      .then((data) => {
        submissions[currentIndex] = data;
        setSubmissions(submissions);
        setCurrentSubmission(data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleBan = async (evt) => {
    const confirmDialog = window.confirm("Are you sure?");
    if (confirmDialog) {
      await client
        .service("users")
        .patch(currentSubmission.user_id, {
          banned: true,
        })
        .then(() => {})
        .catch((e) => {
          console.error(e);
        });
      await client
        .service("submissions")
        .patch(currentSubmission.id, {
          status: "denied",
        })
        .then((data) => {
          submissions[currentIndex] = data;
          setSubmissions(submissions);
          setCurrentSubmission(data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const nextSubmission = (evt) => {
    const nextIndex = currentIndex + 1;
    if (!submissions[nextIndex]) return;

    setShowPlayer(false);
    setCurrentIndex(nextIndex);
    setCurrentSubmission(submissions[nextIndex]);
    if (contest.type === "alert") {
      cueVideo(submissions[nextIndex].video.id, submissions[nextIndex].video.start, submissions[nextIndex].video.end);
    }
  };

  const prevSubmission = (evt) => {
    const prevIndex = currentIndex - 1;
    if (!submissions[prevIndex]) return;

    setShowPlayer(false);
    setCurrentIndex(prevIndex);
    setCurrentSubmission(submissions[prevIndex]);
    if (contest.type === "alert") {
      cueVideo(submissions[prevIndex].video.id, submissions[prevIndex].video.start, submissions[prevIndex].video.end);
    }
  };

  const handleRemove = async (evt) => {
    const confirmDialog = window.confirm("Are you sure?");
    if (!confirmDialog) return;
    await client
      .service("submissions")
      .remove(currentSubmission.id)
      .then(() => {
        const newSubmissions = [...submissions];
        const index = submissions.indexOf(currentSubmission);
        if (index !== -1) {
          newSubmissions.splice(index, 1);
          setSubmissions(newSubmissions);
          setCurrentSubmission(newSubmissions[index]);
          setCurrentIndex(index);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handlePlayerClick = (evt) => {
    setShowPlayer(true);
  };

  const handleArrayIndexChange = (evt) => {
    if (isNaN(evt.target.value)) return;
    if (arrayTimeout.current) clearTimeout(arrayTimeout.current);
    arrayTimeout.current = setTimeout(() => {
      const index = evt.target.value - 1;
      if (!submissions[index]) return;

      setShowPlayer(false);
      setCurrentIndex(index);
      setCurrentSubmission(submissions[index]);
      if (contest.type === "alert") {
        cueVideo(submissions[index].video.id, submissions[index].video.start, submissions[index].video.end);
      }
    }, 250);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isNaN(submissionIdInput) || submissionIdInput === null) return;
      let s,
        index,
        id = submissionIdInput.toString();
      for (let i = 0; i < submissions.length; i++) {
        const submission = submissions[i];
        if (id === submission.id) {
          s = submission;
          index = i;
          break;
        }
      }

      if (!s) return;

      setShowPlayer(false);
      setCurrentIndex(index);
      setCurrentSubmission(submissions[index]);

      if (contest.type === "alert") {
        cueVideo(submissions[index].video.id, submissions[index].video.start, submissions[index].video.end);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionIdInput]);

  const handleFocus = (e) => e.target.select();

  const onIdChange = (e) => {
    if (idTimeout.current) clearTimeout(idTimeout.current);
    idTimeout.current = setTimeout(() => {
      setSubmissionIdInput(e.target.value);
    }, 250);
  };

  if (props.user === undefined || contestExists === null)
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

  if (!contestExists) return <Redirect to="/contest" />;
  if (!props.user) return <Redirect to="/contest" />;
  if (props.user.type !== "mod" && props.user.type !== "admin") return <Redirect to="/contest" />;

  return (
    <SimpleBar className={classes.parent}>
      <div className={isMobile ? classes.mobileContainer : classes.container}>
        <div className={classes.box}>
          <div className={classes.inner}>
            <Box display="block" textAlign="center">
              <img src={logo} className={classes.banner} alt="" />
              <div className={classes.navbar}>
                <Button variant="outlined" onClick={showSubmissions} className={classes.button}>
                  ALL
                </Button>
                <Button variant="outlined" onClick={showDeniedVideos} className={classes.button}>
                  Denied
                </Button>
                <Button variant="outlined" onClick={showUnapprovedSubmissions} className={classes.button}>
                  Unapproved
                </Button>
                <Button variant="outlined" onClick={showApprovedSubmissions} className={classes.button}>
                  Approved
                </Button>
                <Button variant="outlined" onClick={showWinnersSubmissions} className={classes.button}>
                  Winners
                </Button>
              </div>
              {winnerUI ? (
                <WinnerUI contest={contest} submissions={submissions} />
              ) : (
                <>
                  {submissions === undefined ? (
                    <></>
                  ) : submissions.length === 0 ? (
                    <Box className={classes.nothing}>
                      <Typography variant="h5" className={classes.text}>
                        Nothing here..
                      </Typography>
                    </Box>
                  ) : !currentSubmission || currentIndex == null ? (
                    <></>
                  ) : (
                    <>
                      <div className={classes.top}>
                        <Box
                          display="flex"
                          justifyContent="center"
                          style={{
                            marginTop: "0.3rem",
                            marginBottom: "0.3rem",
                            marginRight: "1rem",
                          }}
                        >
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="body1" className={classes.textLabel}>
                              {`Submission ID: `}
                            </Typography>
                          </Box>
                          <input
                            type="text"
                            className={`${classes.arrayInput} ${classes.input}`}
                            autoCapitalize="off"
                            autoCorrect="off"
                            autoComplete="off"
                            defaultValue={currentSubmission.id}
                            onFocus={handleFocus}
                            onChange={onIdChange}
                          />
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="center"
                          style={{
                            marginTop: "0.3rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <input
                            key={currentSubmission.id}
                            type="text"
                            className={`${classes.arrayInput} ${classes.input}`}
                            autoCapitalize="off"
                            autoCorrect="off"
                            autoComplete="off"
                            required={true}
                            onFocus={handleFocus}
                            defaultValue={(currentIndex + 1).toString()}
                            onChange={handleArrayIndexChange}
                          />
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="body1" className={classes.textLabel}>
                              {`/ ${submissions.length}`}
                            </Typography>
                          </Box>
                        </Box>
                      </div>
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <div className={classes.left}>
                          <Button variant="outlined" onClick={prevSubmission}>
                            {`<`}
                          </Button>
                        </div>
                        <div className={classes.player}>
                          {contest.type === "song" && (
                            <Box display="flex" flexDirection="column" width="100%">
                              <iframe
                                title="Player"
                                width="100%"
                                height="160"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src={`https://w.soundcloud.com/player/?url=${currentSubmission.video.link.replace(
                                  /(www\.|m\.)/,
                                  ""
                                )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                              />
                            </Box>
                          )}

                          {contest.type === "alert" && currentSubmission.video.source === "youtube" && (
                            <div
                              style={{
                                backgroundColor: "black",
                                height: "500px",
                                width: "800px",
                              }}
                              onClick={handlePlayerClick}
                            >
                              <Youtube
                                id="player"
                                containerClassName={showPlayer ? "" : classes.hidden}
                                opts={{
                                  height: "500px",
                                  width: "800px",
                                  playerVars: {
                                    autoplay: 0,
                                    playsinline: 1,
                                    rel: 0,
                                    modestbranding: 1,
                                  },
                                }}
                                onReady={onReady}
                              />
                            </div>
                          )}

                          {contest.type === "alert" && currentSubmission.video.source === "tiktok" && (
                            <div
                              className="tiktok-container"
                              style={{
                                backgroundColor: "black",
                                height: "500px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                              }}
                              onClick={handlePlayerClick}
                            >
                              <iframe
                                className={showPlayer ? "tiktok-iframe" : classes.hidden}
                                title="Player"
                                width="300px"
                                height="500px"
                                scrolling="no"
                                frameBorder="no"
                                allowFullScreen
                                src={`https://tiktok.com/embed/${currentSubmission.video.id}`}
                              />
                            </div>
                          )}

                          {contest.type === "clips" && (
                            <div
                              style={{
                                backgroundColor: "black",
                                height: "500px",
                                width: "800px",
                              }}
                              onClick={handlePlayerClick}
                            >
                              {showPlayer && (
                                <iframe
                                  title={currentSubmission.video.id}
                                  src={`https://clips.twitch.tv/embed?clip=${currentSubmission.video.id}&parent=${window.location.hostname}`}
                                  height="500px"
                                  width="800px"
                                  allowFullScreen={true}
                                  preload="auto"
                                  frameBorder="0"
                                />
                              )}
                            </div>
                          )}

                          {contest.type === "review" && (
                            <Box display="flex" flexDirection="column" width="100%">
                              <Tweet tweetId={currentSubmission.video.id} options={{ align: "center" }} />
                            </Box>
                          )}

                          <div className={classes.textBox}>
                            <Typography variant="h5" className={classes.text}>
                              {`${currentSubmission.title}`}
                            </Typography>
                            <Typography variant="h5" className={classes.text}>
                              {`${currentSubmission.display_name}`}
                            </Typography>
                            <Link underline="hover" href={currentSubmission.video.link} target="_blank" rel="noreferrer noopener" color="textSecondary">
                              <Typography variant="caption">{`${currentSubmission.video.link}`}</Typography>
                            </Link>
                            <div style={{ marginTop: "0.5rem" }}>
                              <Typography variant="caption" style={{ wordBreak: "break-word" }}>
                                {`${currentSubmission.comment}`}
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className={classes.right}>
                          <Button variant="outlined" onClick={nextSubmission}>
                            {`>`}
                          </Button>
                        </div>
                      </Box>
                      <div className={classes.bottomNav}>
                        <Box display="flex" justifyContent="center">
                          {submissionUI ? (
                            <div>
                              <Box display="flex">
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleApproval}>
                                    {`Approve`}
                                  </Button>
                                </div>
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleDeny} color="error">
                                    {`Deny`}
                                  </Button>
                                </div>
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleRemove} color="error">
                                    {`Remove`}
                                  </Button>
                                </div>
                              </Box>
                              <div style={{ marginTop: "1rem" }}>
                                <Button variant="outlined" onClick={handleBan} color="error">
                                  {`Ban User`}
                                </Button>
                              </div>
                            </div>
                          ) : deniedUI ? (
                            <div>
                              <Box display="flex">
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleUnApproval}>
                                    {`Un-deny`}
                                  </Button>
                                </div>
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleRemove} color="error">
                                    {`Remove`}
                                  </Button>
                                </div>
                              </Box>
                              <div style={{ marginTop: "1rem" }}>
                                <Button variant="outlined" onClick={handleBan} color="error">
                                  {`Ban User`}
                                </Button>
                              </div>
                            </div>
                          ) : unapprovedUI ? (
                            <div>
                              <Box display="flex">
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleApproval}>
                                    {`Approve`}
                                  </Button>
                                </div>
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleDeny} color="error">
                                    {`Deny`}
                                  </Button>
                                </div>
                                <div style={{ marginRight: "1rem" }}>
                                  <Button variant="outlined" onClick={handleRemove} color="error">
                                    {`Remove`}
                                  </Button>
                                </div>
                              </Box>
                              <div style={{ marginTop: "1rem" }}>
                                <Button variant="outlined" onClick={handleBan} color="error">
                                  {`Ban User`}
                                </Button>
                              </div>
                            </div>
                          ) : approvedUI ? (
                            <>
                              <Button variant="outlined" onClick={handleUnApproval} color="error">
                                {`Un-Approve`}
                              </Button>
                              <Switch
                                checked={currentSubmission.winner}
                                onChange={handleWinnerChange}
                                classes={{
                                  track: classes.switch_track,
                                  switchBase: classes.switch_base,
                                  colorPrimary: classes.switch_primary,
                                }}
                              />
                              <div style={{ marginTop: "0.4rem" }}>
                                <Typography variant="body1" className={classes.text}>
                                  Winner
                                </Typography>
                              </div>
                            </>
                          ) : (
                            <></>
                          )}
                        </Box>
                      </div>
                    </>
                  )}
                </>
              )}
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
    paddingRight: "5rem",
    paddingLeft: "5rem",
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
  player: {
    width: "800px",
  },
  navbar: {
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "space-evenly",
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
  denyButton: {
    color: "#fff",
    backgroundColor: "red",
    "&:hover": {
      backgroundColor: "red",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
  },
  text: {
    color: "#fff",
  },
  nothing: {
    marginTop: "2rem",
  },
  left: {
    marginRight: "3rem",
  },
  right: {
    marginLeft: "3rem",
  },
  bottomNav: {
    marginTop: "1rem",
  },
  navButton: {
    marginRight: "1rem",
  },
  switch_track: {
    backgroundColor: "#fff",
  },
  switch_base: {
    color: "#c2ffc7",
    "&.Mui-disabled": {
      color: "#e886a9",
    },
    "&.Mui-checked": {
      color: "#c2ffc7",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#4CAF50",
    },
  },
  switch_primary: {
    color: "#4CAF50",
    "&.Mui-checked": {
      color: "#4CAF50",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#4CAF50",
    },
  },
  list: {
    display: "flex",
    maxWidth: "800px",
    overflow: "auto",
  },
  item: {
    border: "1px solid lightgrey",
    padding: "1rem",
    marginBottom: "0.2rem",
    marginRight: "0.1rem",
    marginLeft: "0.1rem",
  },
  listContainer: {
    width: "800px",
    border: "1px solid lightgrey",
    padding: "1rem",
  },
  currentItem: {
    border: "1px solid lightgrey",
    padding: "1rem",
    marginBottom: "0.2rem",
    marginRight: "0.1rem",
    marginLeft: "0.1rem",
    backgroundColor: "green",
  },
  hidden: {
    display: "none",
  },
  arrayInput: {
    borderBottomLeftRadius: "4px",
    borderTopRightRadius: "4px",
    borderBottomRightRadius: "4px",
    borderTopLeftRadius: "4px",
    textAlign: "center",
    display: "block",
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    fontSize: "1rem",
    fontWeight: "400",
    width: "60px",
  },
  input: {
    appearance: "none",
    backgroundClip: "padding-box",
    backgroundColor: "inherit",
    border: "2px solid rgba(0,0,0,.05)",
    color: "#efeff1",
    height: "1.6rem",
    lineHeight: "1.3",
    transition: "box-shadow .1s ease-in,border .1s ease-in,background-color .1s ease-in",
    transitionProperty: "box-shadow,border,background-color",
    transitionDuration: ".1s,.1s,.1s",
    transitionTimingFunction: "ease-in,ease-in,ease-in",
    transitionDelay: "0s,0s,0s",
    "&:focus": {
      backgroundColor: "rgb(14 14 14/1)",
      borderColor: "#2079ff",
      outline: "none",
    },
  },
}));
