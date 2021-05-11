import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Button,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@material-ui/core";
import SimpleBar from "simplebar-react";
import loadingLogo from "./assets/jammin.gif";
import logo from "./assets/contestlogo.png";
import Youtube from "react-youtube";
import client from "./client";

export default function Winners(props) {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [player, setPlayer] = useState(undefined);
  const [submissions, setSubmissions] = useState(undefined);
  const [currentSubmission, setCurrentSubmission] = useState(undefined);
  const [currentIndex, setCurrentIndex] = useState(undefined);
  const contestId = props.match.params.contestId;

  useEffect(() => {
    document.title = "Sub Alert Contest - Poke";
    const fetchSubmissions = async () => {
      await client
        .service("submissions")
        .find({
          query: {
            contest_id: contestId,
            $sort: {
              rank: 1,
            },
          },
        })
        .then((data) => {
          const filteredSubmissions = data.filter((submission) => submission.winner);
          setSubmissions(filteredSubmissions);
          setCurrentSubmission(filteredSubmissions[0]);
          setCurrentIndex(0);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchSubmissions();
    return;
  }, [contestId]);

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

  const nextSubmission = (evt) => {
    const nextIndex = currentIndex + 1;
    if (!submissions[nextIndex]) return;

    setCurrentSubmission(submissions[nextIndex]);
    setCurrentIndex(nextIndex);
    cueVideo(
      submissions[nextIndex].video.id,
      submissions[nextIndex].video.start,
      submissions[nextIndex].video.end
    );
  };

  const prevSubmission = (evt) => {
    const prevIndex = currentIndex - 1;
    if (!submissions[prevIndex]) return;

    setCurrentSubmission(submissions[prevIndex]);
    setCurrentIndex(prevIndex);
    cueVideo(
      submissions[prevIndex].video.id,
      submissions[prevIndex].video.start,
      submissions[prevIndex].video.end
    );
  };

  if (props.user === undefined)
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

  return (
    <SimpleBar className={classes.parent}>
      <div className={isMobile ? classes.mobileContainer : classes.container}>
        <div className={classes.box}>
          <div className={classes.inner}>
            <Box display="block" textAlign="center">
              <img src={logo} className={classes.banner} alt="" />
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
                      <Youtube
                        id="player"
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
                      <div className={classes.textBox}>
                        <Typography variant="h5" className={classes.text}>
                          {`${currentSubmission.title} - ${currentSubmission.display_name}`}
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
                            {/*`${currentSubmission.comment}`*/}
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
}));
