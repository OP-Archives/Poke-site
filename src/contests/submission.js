import React, { useEffect, useState } from "react";
import { Typography, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import SimpleBar from "simplebar-react";
import logo from "../assets/contestlogo.png";
import { Alert } from "@mui/material";
import client from "../client";
import Loading from "../utils/Loading";

export default function Creation(props) {
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
  const [source, setSource] = useState(1);
  const [link, setLink] = useState("");
  const { type, submission, contest, user } = props;

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
    setLink(evt.target.value);
  };

  useEffect(() => {
    if (link.length === 0) return;
    setLinkError(false);
    const regex =
      contest.type === "alert" && source === 1
        ? //eslint-disable-next-line
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/|shorts\/|clip\/)?)([\w\-]+)(\S+)?$/
        : contest.type === "alert" && source === 2
        ? /tiktok\.com(.*)\/video\/(\d+)/
        : contest.type === "song" && source === 1
        ? //eslint-disable-next-line
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:soundcloud\.com|snd.sc))(\/)(\S+)(\/)(\S+)$/
        : contest.type === "review" && source === 1
        ? /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:twitter\.com))(\/)(\S+)(\/)(\S+)$/
        : contest.type === "clips" && source === 1
        ? /https:\/\/(?:clips|www)\.twitch\.tv\/(?:(?:[a-z]+)\/clip\/)?(\S+)$/
        : null;

    if (!regex.test(link)) {
      setLinkError(true);
      setLinkErrorMsg("Link is not valid!");
      setVideo(null);
      return;
    }

    let newLink = link.valueOf();

    if (contest.type === "review" && link.indexOf("?") !== -1) newLink = link.substring(0, link.indexOf("?"));
    const linkSplit = newLink.split(regex);
    setVideo({
      id:
        contest.type === "alert" && source === 1
          ? linkSplit[5]
          : contest.type === "alert" && source === 2
          ? linkSplit[2]
          : contest.type === "song" && source === 1
          ? linkSplit[7]
          : contest.type === "review" && source === 1
          ? linkSplit[7]
          : contest.type === "clips" && source === 1
          ? linkSplit[1]
          : null,
      link: link,
      source:
        contest.type === "alert" && source === 1
          ? "youtube"
          : contest.type === "alert" && source === 2
          ? "tiktok"
          : contest.type === "song" && source === 1
          ? "soundcloud"
          : contest.type === "review" && source === 1
          ? "twitter"
          : contest.type === "clips" && source === 1
          ? "twitch"
          : null,
    });
  }, [link, contest, source]);

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
      source: video.source,
      start: start !== undefined ? start : null,
      end: end !== undefined ? end : null,
    };
    return client
      .service("submissions")
      .create({
        contestId: contest.id,
        userId: user.id,
        username: user.username,
        display_name: user.display_name,
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
      source: video.source,
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

  const handleSource = (event) => {
    setSource(event.target.value);
  };

  if (user === undefined) return <Loading />;

  return (
    <SimpleBar style={{ minHeight: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <img alt="" src={logo} sx={{ height: "auto", width: "100%" }} />
        <Typography variant="h7" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 1 }}>{`Contest ID: ${contest.id}`}</Typography>
        <Typography variant="h7" sx={{ fontFamily: "Anton", textTransform: "uppercase" }}>{`${contest.title}`}</Typography>
        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 1 }} color="primary">
          {type === "Modify" ? "Modify Submission" : "Submission"}
        </Typography>
        {error && (
          <Alert sx={{ mt: 1 }} severity="error">
            {errorMsg}
          </Alert>
        )}
        <form noValidate>
          {(contest.type === "song" || contest.type === "alert" || contest.type === "clips") && (
            <TextField
              sx={{ mt: 1 }}
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
            <Alert sx={{ mt: 1 }} severity="error">
              {linkErrorMsg}
            </Alert>
          )}
          {contest.type === "alert" && (
            <FormControl fullWidth required sx={{ mt: 1 }}>
              <InputLabel id="source-label">Source</InputLabel>
              <Select labelId="source-label" value={source} label="Source" onChange={handleSource}>
                <MenuItem value={1}>Youtube</MenuItem>
                <MenuItem value={2}>Tiktok</MenuItem>
              </Select>
            </FormControl>
          )}
          {contest.type === "song" && (
            <FormControl fullWidth required sx={{ mt: 1 }}>
              <InputLabel id="source-label">Source</InputLabel>
              <Select labelId="source-label" value={source} label="Source" onChange={handleSource}>
                <MenuItem value={1}>Soundcloud</MenuItem>
              </Select>
            </FormControl>
          )}
          {contest.type === "review" && (
            <FormControl fullWidth required sx={{ mt: 1 }}>
              <InputLabel id="source-label">Source</InputLabel>
              <Select labelId="source-label" value={source} label="Source" onChange={handleSource}>
                <MenuItem value={1}>Twitter</MenuItem>
              </Select>
            </FormControl>
          )}
          {contest.type === "clips" && (
            <FormControl fullWidth required sx={{ mt: 1 }}>
              <InputLabel id="source-label">Source</InputLabel>
              <Select labelId="source-label" value={source} label="Source" onChange={handleSource}>
                <MenuItem value={1}>Twitch</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField variant="outlined" margin="normal" required fullWidth label={"Link"} name={"Link"} autoComplete="off" autoCapitalize="off" autoCorrect="off" onChange={handleLinkChange} />
          {contest.type === "alert" && source === 1 && (
            <>
              {startError && (
                <Alert sx={{ mt: 1 }} severity="error">
                  {startErrorMsg}
                </Alert>
              )}
              <TextField variant="filled" margin="normal" fullWidth label="Start Timestamp (optional)" name="Start" autoComplete="off" autoCapitalize="off" autoCorrect="off" onChange={startChange} />
            </>
          )}
          {contest.type === "alert" && source === 1 && (
            <>
              {endError && (
                <Alert sx={{ mt: 1 }} severity="error">
                  {endErrorMsg}
                </Alert>
              )}
              <TextField variant="filled" margin="normal" fullWidth label="End Timestamp (optional)" name="End" autoComplete="off" autoCapitalize="off" autoCorrect="off" onChange={endChange} />
            </>
          )}
          {commentError && (
            <Alert sx={{ mt: 1 }} severity="error">
              {commentErrorMsg}
            </Alert>
          )}
          {(contest.type === "song" || contest.type === "alert") && (
            <TextField
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
            <Button sx={{ mt: 1 }} type="submit" fullWidth variant="contained" color="primary" onClick={handleModify} disabled={contest.type !== "review" ? title.length === 0 || !video : !video}>
              Modify
            </Button>
          ) : (
            <Button sx={{ mt: 1 }} type="submit" fullWidth variant="contained" color="primary" onClick={handleSubmit} disabled={contest.type !== "review" ? title.length === 0 || !video : !video}>
              Submit
            </Button>
          )}
        </form>
      </Box>
    </SimpleBar>
  );
}
