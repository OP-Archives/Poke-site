import React, { useState } from "react";
import { Typography, Button, Box, TextField, Switch, FormControl, Select, MenuItem } from "@mui/material";
import SimpleBar from "simplebar-react";
import logo from "../assets/contestlogo.png";
import { Alert } from "@mui/material";
import client from "../client";
import Loading from "../utils/Loading";

export default function Creation(props) {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(undefined);
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(true);
  const [submission, setSubmission] = useState(true);
  const [type, setType] = useState("alert");

  const handleTitleChange = (evt) => {
    setTitle(evt.target.value);
  };

  const handleActiveChange = (_) => {
    setActive(!active);
  };

  const handleSubmissionChange = (_) => {
    setSubmission(!submission);
  };

  const handleCreate = (evt) => {
    if (evt) evt.preventDefault();
    return client
      .service("contests")
      .create({
        title: title,
        active: active,
        type: type,
        submission: submission,
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

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  if (props.user === undefined) return <Loading />;

  return (
    <SimpleBar style={{ minHeight: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <img alt="" src={logo} sx={{ height: "auto", width: "100%" }} />
        <Typography variant="h4" sx={{ fontFamily: "Anton", textTransform: "uppercase" }}>
          Create Contest
        </Typography>
        {error && (
          <Alert sx={{ mt: 1 }} severity="error">
            {errorMsg}
          </Alert>
        )}
        <form noValidate>
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
            onChange={handleTitleChange}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select value={type} onChange={handleTypeChange} autoWidth>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="song">Song</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="clips">Clips</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <Switch checked={active} onChange={handleActiveChange} />
            <Typography variant="body1">Active Contest</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Switch checked={submission} onChange={handleSubmissionChange} />
            <Typography variant="body1">Allow Submissions</Typography>
          </Box>
          <Button type="submit" fullWidth variant="contained" color="primary" onClick={handleCreate} disabled={title.length === 0} sx={{ mt: 1 }}>
            Create
          </Button>
        </form>
      </Box>
    </SimpleBar>
  );
}
