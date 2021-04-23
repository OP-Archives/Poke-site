import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Button,
  Box,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import SimpleBar from "simplebar-react";
import loadingLogo from "./assets/jammin.gif";
import logo from "./assets/contestlogo.png";
import { Alert } from "@material-ui/lab";
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

  const handleVideoLinkChange = (evt) => {
    setLinkError(false);
    const link = evt.target.value;
    //eslint-disable-next-line
    const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
    if (!regex.test(link)) {
      setLinkError(true);
      setLinkErrorMsg("Youtube link is not valid");
      setVideo(null);
      return;
    }
    const videoSplit = link.split(regex);
    setVideo({
      id: videoSplit[5],
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
      setStartErrorMsg(
        "Must be a positive number & Start timestamp must be less than start"
      );
      setStart(undefined);
      return;
    }

    console.log(number);
    console.log(end);
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
        contest_id: props.contest.id,
        user_id: props.user.id,
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <div style={{ textAlign: "center" }}>
          <img alt="" src={logo} height="auto" width="100%" />
          <Typography variant="h4" className={classes.title}>
            {`${props.contest.title} Submission`}
          </Typography>
          {error ? (
            <Alert style={{ marginTop: "1rem" }} severity="error">
              {errorMsg}
            </Alert>
          ) : (
            <></>
          )}
          <form className={classes.form} noValidate>
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
            {linkError ? (
              <Alert style={{ marginTop: "1rem" }} severity="error">
                {linkErrorMsg}
              </Alert>
            ) : (
              <></>
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
              label="Youtube Link"
              name="Youtube Link"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              onChange={handleVideoLinkChange}
            />
            {startError ? (
              <Alert style={{ marginTop: "1rem" }} severity="error">
                {startErrorMsg}
              </Alert>
            ) : (
              <></>
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
            {endError ? (
              <Alert style={{ marginTop: "1rem" }} severity="error">
                {endErrorMsg}
              </Alert>
            ) : (
              <></>
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
            {commentError ? (
              <Alert style={{ marginTop: "1rem" }} severity="error">
                {commentErrorMsg}
              </Alert>
            ) : (
              <></>
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSubmit}
              disabled={title.length === 0 || !video}
              style={{ color: "#fff" }}
            >
              Submit
            </Button>
          </form>
        </div>
      </Box>
    </SimpleBar>
  );
}

const useStyles = makeStyles(() => ({
  parent: {
    height: "100%",
    padding: "1rem",
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
