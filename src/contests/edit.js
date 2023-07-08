import React, { useState } from "react";
import { Typography, Button, Box, TextField, Switch, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import logo from "../assets/contestlogo.png";
import { Alert } from "@mui/material";
import client from "./client";
import Loading from "../utils/Loading";

export default function Edit(props) {
  const { contest, user } = props;
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(undefined);
  const [title, setTitle] = useState(contest.title);
  const [active, setActive] = useState(contest.active);
  const [submission, setSubmission] = useState(contest.submission);
  const [type, setType] = useState(contest.type);

  const handleTitleChange = (evt) => {
    setTitle(evt.target.value);
  };

  const handleActiveChange = (_) => {
    setActive(!active);
  };

  const handleSubmissionChange = (_) => {
    setSubmission(!submission);
  };

  const handleEdit = (evt) => {
    if (evt) evt.preventDefault();
    return client
      .service("contests")
      .patch(contest.id, {
        title: title,
        active: active,
        submission: submission,
        type: type,
      })
      .then(() => {
        window.location.reload();
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setErrorMsg("Something went wrong..");
      });
  };

  const handleDelete = async (evt) => {
    if (evt) evt.preventDefault();
    const confirmDialog = window.confirm("Are you sure?");
    if (confirmDialog) {
      await client
        .service("matches")
        .remove(null, {
          query: { contestId: contest.id },
        })
        .catch((e) => {
          console.error(e);
        });

      return client
        .service("contests")
        .remove(contest.id)
        .then(() => {
          window.location.reload();
        })
        .catch((e) => {
          console.error(e);
          setError(true);
          setErrorMsg("Something went wrong..");
        });
    }
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  if (user === undefined) return <Loading />;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <img alt="" src={logo} sx={{ height: "auto", width: "100%" }} />
      <Typography variant="h4" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 1 }} color="primary">{`Edit`}</Typography>
      <Typography variant="h7" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 1 }}>{`Contest ID: ${contest.id}`}</Typography>
      <Typography variant="h7" sx={{ fontFamily: "Anton", textTransform: "uppercase" }}>{`${contest.title}`}</Typography>
      {error && (
        <Alert sx={{ mt: 1 }} severity="error">
          {errorMsg}
        </Alert>
      )}
      <form noValidate style={{ marginTop: 1 }}>
        <TextField
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
          defaultValue={contest.title}
          onChange={handleTitleChange}
        />
        <FormControl fullWidth sx={{ mt: 1, width: "100%" }}>
          <InputLabel id="select-label">Type</InputLabel>
          <Select labelId="select-label" value={type} onChange={handleTypeChange} autoWidth>
            <MenuItem value="alert">Alert</MenuItem>
            <MenuItem value="song">Song</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="clips">Clips</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <Switch checked={active} onChange={handleActiveChange} />
          <Typography variant="body1">Active Contest</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Switch checked={submission} onChange={handleSubmissionChange} />
          <Typography variant="body1">Allow Submissions</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            onClick={handleEdit}
            disabled={title === contest.title && submission === contest.submission && active === contest.active && type === contest.type}
          >
            Edit
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button fullWidth type="submit" variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      </form>
    </Box>
  );
}
