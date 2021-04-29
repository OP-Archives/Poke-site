import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Button,
  Box,
  CircularProgress,
  useMediaQuery,
  Switch,
} from "@material-ui/core";
import SimpleBar from "simplebar-react";
import loadingLogo from "./assets/jammin.gif";
import logo from "./assets/contestlogo.png";
import Youtube from "react-youtube";
import client from "./client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Redirect } from "react-router-dom";

export default function Manage(props) {
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
  const contestId = props.match.params.contestId;

  useEffect(() => {
    document.title = "Sub Alert Contest - Poke";
    const fetchContest = async () => {
      await client
        .service("contests")
        .get(contestId)
        .then(() => {
          setContestExists(true);
        })
        .catch(() => {
          setContestExists(false);
        });
    };
    fetchContest();
    return;
  }, [contestId]);

  const fetchSubmissions = async (rank = false) => {
    let res = [];
    await client
      .service("submissions")
      .find({
        query: {
          contest_id: contestId,
          $sort: rank
            ? {
                rank: 1,
              }
            : {
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
    if (tmp_submissions.length > 0 && player)
      cueVideo(
        tmp_submissions[0].video.id,
        tmp_submissions[0].video.start,
        tmp_submissions[0].video.end
      );
  };

  const showUnapprovedSubmissions = async (evt) => {
    let tmp_submissions = await fetchSubmissions();
    tmp_submissions = tmp_submissions.filter(
      (submission) => submission.status === ""
    );
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(false);
    setUnapprovedUI(true);
    setSubmissionUI(false);
    setApprovedUI(false);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player)
      cueVideo(
        tmp_submissions[0].video.id,
        tmp_submissions[0].video.start,
        tmp_submissions[0].video.end
      );
  };

  const showApprovedSubmissions = async (evt) => {
    let tmp_submissions = await fetchSubmissions();
    tmp_submissions = tmp_submissions.filter(
      (submission) => submission.status === "approved"
    );
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(false);
    setUnapprovedUI(false);
    setSubmissionUI(false);
    setApprovedUI(true);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player)
      cueVideo(
        tmp_submissions[0].video.id,
        tmp_submissions[0].video.start,
        tmp_submissions[0].video.end
      );
  };

  const showDeniedVideos = async (evt) => {
    let tmp_submissions = await fetchSubmissions();
    tmp_submissions = tmp_submissions.filter(
      (submission) => submission.status === "denied"
    );
    setSubmissions(tmp_submissions);
    setCurrentSubmission(tmp_submissions[0]);
    setCurrentIndex(0);
    setDeniedUI(true);
    setUnapprovedUI(false);
    setSubmissionUI(false);
    setApprovedUI(false);
    setWinnerUI(false);
    if (tmp_submissions.length > 0 && player)
      cueVideo(
        tmp_submissions[0].video.id,
        tmp_submissions[0].video.start,
        tmp_submissions[0].video.end
      );
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
    if (tmp_submissions.length > 0 && player)
      cueVideo(
        tmp_submissions[0].video.id,
        tmp_submissions[0].video.start,
        tmp_submissions[0].video.end
      );
  };

  const onReady = (evt) => {
    const argPlayer = evt.target;
    setPlayer(argPlayer);
    if (currentSubmission)
      cueVideo(
        currentSubmission.video.id,
        currentSubmission.video.start,
        currentSubmission.video.end,
        argPlayer
      );
  };

  const handleApproval = async (evt) => {
    await client
      .service("submissions")
      .patch(currentSubmission.id, {
        status: "approved",
      })
      .then((data) => {
        submissions[currentSubmission] = data;
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
        submissions[currentSubmission] = data;
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
        submissions[currentSubmission] = data;
        setSubmissions(submissions);
        setCurrentSubmission(data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleWinnerChange = async (evt) => {
    if (!currentSubmission.approved) return;
    await client
      .service("submissions")
      .patch(currentSubmission.id, {
        winner: !currentSubmission.winner,
      })
      .then((data) => {
        submissions[currentSubmission] = data;
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
          submissions[currentSubmission] = data;
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
    cueVideo(
      submissions[nextIndex].video.id,
      submissions[nextIndex].video.start,
      submissions[nextIndex].video.end
    );
  };

  const prevSubmission = (evt) => {
    const prevIndex = currentIndex - 1;
    if (!submissions[prevIndex]) return;

    setShowPlayer(false);
    setCurrentIndex(prevIndex);
    setCurrentSubmission(submissions[prevIndex]);
    cueVideo(
      submissions[prevIndex].video.id,
      submissions[prevIndex].video.start,
      submissions[prevIndex].video.end
    );
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(submissions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client
        .service("submissions")
        .patch(item.id, {
          rank: i + 1,
        })
        .catch((e) => {
          console.error(e);
        });
    }

    setCurrentIndex(items.indexOf(currentSubmission));
    setSubmissions(items);
  };

  const handleItemClick = (data, evt) => {
    if (evt.defaultPrevented) return;
    setCurrentSubmission(data);
    setCurrentIndex(submissions.indexOf(data));
    cueVideo(data.video.id, data.video.start, data.video.end);
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

  if (props.user === undefined || contestExists === null)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
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
  if (props.user.type !== "mod" && props.user.type !== "admin")
    return <Redirect to="/contest" />;

  return (
    <SimpleBar className={classes.parent}>
      <div className={isMobile ? classes.mobileContainer : classes.container}>
        <div className={classes.box}>
          <div className={classes.inner}>
            <Box display="block" textAlign="center">
              <img src={logo} className={classes.banner} alt="" />
              <div className={classes.navbar}>
                <Button
                  variant="outlined"
                  onClick={showSubmissions}
                  className={classes.button}
                >
                  ALL
                </Button>
                <Button
                  variant="outlined"
                  onClick={showDeniedVideos}
                  className={classes.button}
                >
                  Denied Videos
                </Button>
                <Button
                  variant="outlined"
                  onClick={showUnapprovedSubmissions}
                  className={classes.button}
                >
                  Unapproved Videos
                </Button>
                <Button
                  variant="outlined"
                  onClick={showApprovedSubmissions}
                  className={classes.button}
                >
                  Approved Videos
                </Button>
                <Button
                  variant="outlined"
                  onClick={showWinnersSubmissions}
                  className={classes.button}
                >
                  Winners
                </Button>
              </div>
              {submissions === undefined ? (
                <></>
              ) : submissions.length === 0 ? (
                <Box className={classes.nothing}>
                  <Typography variant="h5" className={classes.text}>
                    Nothing here..
                  </Typography>
                </Box>
              ) : !currentSubmission ? (
                <></>
              ) : (
                <>
                  <div className={classes.top}>
                    <div style={{ marginRight: "1rem" }}>
                      <Typography variant="body1" className={classes.textLabel}>
                        {`Submission ID: ${currentSubmission.id}`}
                      </Typography>
                    </div>
                    <Box
                      display="flex"
                      justifyContent="center"
                      style={{ marginTop: "0.3rem", marginBottom: "0.3rem" }}
                    >
                      <Typography variant="body1" className={classes.textLabel}>
                        {`${currentIndex + 1} / ${submissions.length}`}
                      </Typography>
                    </Box>
                  </div>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div className={classes.left}>
                      <Button
                        variant="outlined"
                        onClick={prevSubmission}
                        className={classes.button}
                      >
                        {`<`}
                      </Button>
                    </div>
                    <div className={classes.player}>
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
                      <div className={classes.textBox}>
                        <Typography variant="h5" className={classes.text}>
                          {`${currentSubmission.title}`}
                        </Typography>
                        <Typography variant="h5" className={classes.text}>
                          {`${currentSubmission.display_name}`}
                        </Typography>
                        <a
                          href={currentSubmission.video.link}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <Typography variant="caption">
                            {`${currentSubmission.video.link}`}
                          </Typography>
                        </a>
                        <div style={{ marginTop: "0.5rem" }}>
                          <Typography
                            variant="caption"
                            style={{ wordBreak: "break-word" }}
                          >
                            {`${currentSubmission.comment}`}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className={classes.right}>
                      <Button
                        variant="outlined"
                        onClick={nextSubmission}
                        className={classes.button}
                      >
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
                              <Button
                                variant="outlined"
                                onClick={handleApproval}
                                className={classes.button}
                              >
                                {`Approve`}
                              </Button>
                            </div>
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleDeny}
                                className={classes.denyButton}
                              >
                                {`Deny`}
                              </Button>
                            </div>
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleRemove}
                                className={classes.denyButton}
                              >
                                {`Remove`}
                              </Button>
                            </div>
                          </Box>
                          <div style={{ marginTop: "1rem" }}>
                            <Button
                              variant="outlined"
                              onClick={handleBan}
                              className={classes.denyButton}
                            >
                              {`Ban User`}
                            </Button>
                          </div>
                        </div>
                      ) : deniedUI ? (
                        <div>
                          <Box display="flex">
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleUnApproval}
                                className={classes.button}
                              >
                                {`Un-deny`}
                              </Button>
                            </div>
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleRemove}
                                className={classes.denyButton}
                              >
                                {`Remove`}
                              </Button>
                            </div>
                          </Box>
                          <div style={{ marginTop: "1rem" }}>
                            <Button
                              variant="outlined"
                              onClick={handleBan}
                              className={classes.denyButton}
                            >
                              {`Ban User`}
                            </Button>
                          </div>
                        </div>
                      ) : unapprovedUI ? (
                        <div>
                          <Box display="flex">
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleApproval}
                                className={classes.button}
                              >
                                {`Approve`}
                              </Button>
                            </div>
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleDeny}
                                className={classes.denyButton}
                              >
                                {`Deny`}
                              </Button>
                            </div>
                            <div style={{ marginRight: "1rem" }}>
                              <Button
                                variant="outlined"
                                onClick={handleRemove}
                                className={classes.denyButton}
                              >
                                {`Remove`}
                              </Button>
                            </div>
                          </Box>
                          <div style={{ marginTop: "1rem" }}>
                            <Button
                              variant="outlined"
                              onClick={handleBan}
                              className={classes.button}
                            >
                              {`Ban User`}
                            </Button>
                          </div>
                        </div>
                      ) : approvedUI ? (
                        <>
                          <Button
                            variant="outlined"
                            onClick={handleUnApproval}
                            className={classes.button}
                          >
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
                            <Typography
                              variant="body1"
                              className={classes.text}
                            >
                              Winner
                            </Typography>
                          </div>
                        </>
                      ) : winnerUI ? (
                        <div>
                          <div
                            style={{
                              marginTop: "1rem",
                              borderTop: "1px solid lightgrey",
                              borderLeft: "1px solid lightgrey",
                              borderRight: "1px solid lightgrey",
                            }}
                          >
                            <Typography
                              variant="body1"
                              className={classes.text}
                            >
                              Rankings
                            </Typography>
                          </div>
                          <div className={classes.listContainer}>
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                              <Droppable
                                droppableId="winners"
                                direction="horizontal"
                              >
                                {(provided) => (
                                  <div
                                    className={classes.list}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    {submissions.map((data, index) => {
                                      return (
                                        <Draggable
                                          key={data.id}
                                          draggableId={data.id}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                            >
                                              <div
                                                className={
                                                  currentSubmission.id ===
                                                  data.id
                                                    ? classes.currentItem
                                                    : classes.item
                                                }
                                                onClick={(e) =>
                                                  handleItemClick(data, e)
                                                }
                                              >
                                                <Typography
                                                  variant="caption"
                                                  className={classes.text}
                                                >
                                                  {`${data.display_name}`}
                                                </Typography>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </Box>
                  </div>
                </>
              )}
              <div style={{ marginTop: "2rem" }}>
                <a
                  className={classes.navigation}
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://twitter.com/overpowered"
                >
                  <Typography variant="caption">made by OP with 💜</Typography>
                </a>
              </div>
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
}));
