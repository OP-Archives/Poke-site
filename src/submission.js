import React, { useState } from "react";
import { Typography, Button, Box, CircularProgress, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import SimpleBar from "simplebar-react";
import loadingLogo from "./assets/jammin.gif";
import logo from "./assets/contestlogo.png";
import { Alert } from "@mui/material";
import client from "./client";

export default function Creation(props) {
  const classes = useStyles();
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(undefined);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(undefined);
  const [video, setVideo] = useState(undefined);
  const [linkError, setLinkError] = useState(false);
  const [linkErrorMsg, setLinkErrorMsg] = useState(undefined);
  const [commentError, setCommentError] = useState(false);
  const [commentErrorMsg, setCommentErrorMsg] = useState(undefined);
  const [startError, setStartError] = useState(false);
  const [startErrorMsg, setStartErrorMsg] = useState(undefined);
  const [endError, setEndError] = useState(false);
  const [endErrorMsg, setEndErrorMsg] = useState(undefined);
  const { type, submission } = props;

  const handleTitleChange = (evt) => {
    setTitle(evt.target.value);
  };

  const handleCommentChange = (evt) => {
    setCommentError(false);
    if (evt.target.value.length >= 280) {
      setCommentError(true);
      setCommentErrorMsg("Comment is too long..");
      setComment("");
      return;
    }
    setComment(evt.target.value);
  };

  const handleLinkChange = (evt) => {
    setLinkError(false);
    let link = evt.target.value;
    const regex =
      props.contest.type === "alert"
        ? //eslint-disable-next-line
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/|shorts\/)?)([\w\-]+)(\S+)?$/
        : props.contest.type === "song"
        ? //eslint-disable-next-line
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:soundcloud\.com|snd.sc))(\/)(\S+)(\/)(\S+)$/
        : props.contest.type === "review"
        ? /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:twitter\.com))(\/)(\S+)(\/)(\S+)$/
        : props.contest.type === "clips"
        ? /https:\/\/(?:clips|www)\.twitch\.tv\/(?:(?:[a-z]+)\/clip\/)?(\S+)$/
        : null;

    if (!regex.test(link)) {
      setLinkError(true);
      setLinkErrorMsg(
        props.contest.type === "alert"
          ? "Youtube link is not valid.."
          : props.contest.type === "song"
          ? "Soundcloud link is not valid.."
          : props.contest.type === "review"
          ? "Twitter link is not valid.."
          : props.contest.type === "clips"
          ? "Twitch clip link is not valid.."
          : "Something is wrong here..."
      );
      setVideo(null);
      return;
    }
    if (props.contest.type === "review" && link.indexOf("?") !== -1) link = link.substring(0, link.indexOf("?"));
    const linkSplit = link.split(regex);
    setVideo({
      id: props.contest.type === "alert" ? linkSplit[5] : props.contest.type === "song" ? linkSplit[7] : props.contest.type === "review" ? linkSplit[7] : props.contest.type === "clips" ? linkSplit[1] : null,
      link: link,
    });
  };

  const startChange = (evt) => {
    setStartError(false);
    const number = parseInt(evt.target.value);
    if (isNaN(number)) {
      setStartError(true);
      setStartErrorMsg("Must be a number");
      setStart(undefined);
      return;
    }

    if (number < 0) {
      setStartError(true);
      setStartErrorMsg("Must be a positive number & Start timestamp must be less than start");
      setStart(undefined);
      return;
    }

    if (end !== undefined) {
      if (number >= end) {
        setStartError(true);
        setStartErrorMsg("Start timestamp should be less than end timestamp");
        setStart(undefined);
        return;
      }
    }

    setStart(number);
  };

  const endChange = (evt) => {
    setEndError(false);
    const number = parseInt(evt.target.value);
    if (isNaN(number)) {
      setEndError(true);
      setEndErrorMsg("Must be a number");
      setEnd(undefined);
      return;
    }

    if (number < 0) {
      setEndError(true);
      setEndErrorMsg("Must be a positive number");
      setEnd(undefined);
      return;
    }

    if (start !== undefined) {
      if (number <= start) {
        setEndError(true);
        setEndErrorMsg("End timestamp should be greater than start timestamp");
        setEnd(undefined);
        return;
      }
    }

    setEnd(number);
  };

  const handleSubmit = (evt) => {
    if (evt) evt.preventDefault();
    let tmpVideo = {
      id: video.id,
      link: video.link,
      start: start !== undefined ? start : null,
      end: end !== undefined ? end : null,
    };
    return client
      .service("submissions")
      .create({
        contestId: props.contest.id,
        userId: props.user.id,
        username: props.user.username,
        display_name: props.user.display_name,
        video: tmpVideo,
        comment: comment,
        title: title,
      })
      .then(() => {
        window.location.reload();
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setErrorMsg(e.message);
      });
  };

  const handleModify = (evt) => {
    if (evt) evt.preventDefault();
    if (!submission) return;
    let tmpVideo = {
      id: video.id,
      link: video.link,
      start: start !== undefined ? start : null,
      end: end !== undefined ? end : null,
    };
    return client
      .service("submissions")
      .patch(submission.id, {
        video: tmpVideo,
        comment: comment,
        title: title,
      })
      .then(() => {
        window.location.reload();
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setErrorMsg(e.message);
      });
  };

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

  return (
    <SimpleBar className={classes.parent}>
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" backgroundColor="#1d1d1d" padding="1rem">
        <div style={{ textAlign: "center" }}>
          <img alt="" src={logo} height="auto" width="100%" />
          <Typography variant="h4" className={classes.title}>
            {`${props.contest.title} ${type === "Modify" ? "Modify Submission" : "Submission"}`}
          </Typography>
          {error ? (
            <Alert style={{ marginTop: "1rem" }} severity="error">
              {errorMsg}
            </Alert>
          ) : (
            <></>
          )}
          <form className={classes.form} noValidate>
            {(props.contest.type === "song" || props.contest.type === "alert" || props.contest.type === "clips") && (
              <TextField
                inputProps={{
                  style: {
                    backgroundColor: "hsla(0,0%,100%,.15)",
                    color: "#fff",
                  },
                }}
                InputLabelProps={{
                  style: { color: "#fff" },
                }}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Title"
                name="title"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                autoFocus
                onChange={handleTitleChange}
              />
            )}
            {linkError && (
              <Alert style={{ marginTop: "1rem" }} severity="error">
                {linkErrorMsg}
              </Alert>
            )}
            <TextField
              inputProps={{
                style: {
                  backgroundColor: "hsla(0,0%,100%,.15)",
                  color: "#fff",
                },
              }}
              InputLabelProps={{
                style: { color: "#fff" },
              }}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label={
                props.contest.type === "alert"
                  ? "Youtube Link"
                  : props.contest.type === "song"
                  ? "Soundcloud Link"
                  : props.contest.type === "review"
                  ? "Tweet"
                  : props.contest.type === "clips"
                  ? "Twitch Clip Link"
                  : ""
              }
              name={props.contest.type === "alert" ? "Youtube Link" : props.contest.type === "song" ? "Soundcloud Link" : props.contest.type === "clips" ? "Twitch Clip Link" : ""}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              onChange={handleLinkChange}
            />
            {props.contest.type !== "alert" ? (
              <></>
            ) : (
              <>
                {startError && (
                  <Alert style={{ marginTop: "1rem" }} severity="error">
                    {startErrorMsg}
                  </Alert>
                )}
                <TextField
                  inputProps={{
                    style: {
                      backgroundColor: "hsla(0,0%,100%,.15)",
                      color: "#fff",
                    },
                  }}
                  InputLabelProps={{
                    style: { color: "#fff" },
                  }}
                  variant="filled"
                  margin="normal"
                  fullWidth
                  label="Start Timestamp (optional)"
                  name="Start"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  onChange={startChange}
                />
              </>
            )}
            {props.contest.type === "alert" && (
              <>
                {endError && (
                  <Alert style={{ marginTop: "1rem" }} severity="error">
                    {endErrorMsg}
                  </Alert>
                )}
                <TextField
                  inputProps={{
                    style: {
                      backgroundColor: "hsla(0,0%,100%,.15)",
                      color: "#fff",
                    },
                  }}
                  InputLabelProps={{
                    style: { color: "#fff" },
                  }}
                  variant="filled"
                  margin="normal"
                  fullWidth
                  label="End Timestamp (optional)"
                  name="End"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  onChange={endChange}
                />
              </>
            )}
            {commentError && (
              <Alert style={{ marginTop: "1rem" }} severity="error">
                {commentErrorMsg}
              </Alert>
            )}
            {(props.contest.type === "song" || props.contest.type === "alert") && (
              <TextField
                inputProps={{
                  style: {
                    backgroundColor: "hsla(0,0%,100%,.15)",
                    color: "#fff",
                  },
                }}
                InputLabelProps={{
                  style: { color: "#fff" },
                }}
                multiline
                rows={4}
                variant="filled"
                margin="normal"
                fullWidth
                label="Comment"
                name="Comment"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                onChange={handleCommentChange}
              />
            )}
            {type === "Modify" ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleModify}
                disabled={props.contest.type !== "review" ? title.length === 0 || !video : !video}
                style={{ color: "#fff" }}
              >
                Modify
              </Button>
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleSubmit}
                disabled={props.contest.type !== "review" ? title.length === 0 || !video : !video}
                style={{ color: "#fff" }}
              >
                Submit
              </Button>
            )}
          </form>
        </div>
      </Box>
    </SimpleBar>
  );
}

const useStyles = makeStyles(() => ({
  parent: {
    height: "100%",
  },
  title: {
    fontFamily: "Anton",
    fontWeight: "550",
    color: "rgb(255, 255, 255)",
    textTransform: "uppercase",
  },
  form: {
    width: "100%",
    marginTop: "1rem",
  },
  submit: {
    marginTop: "1rem",
    backgroundColor: "#008230",
    "&:hover": {
      backgroundColor: "#008230",
      opacity: "0.7",
    },
  },
  textLabel: {
    color: "#fff",
  },
}));
