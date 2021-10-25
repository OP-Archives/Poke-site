import React, { useState } from "react";
import { Typography, Button, Box, CircularProgress, TextField, Switch, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
  const [title, setTitle] = useState(props.contest.title);
  const [active, setActive] = useState(props.contest.active);
  const [submission, setSubmission] = useState(props.contest.submission);
  const [type, setType] = useState(props.contest.type);

  const handleTitleChange = (evt) => {
    setTitle(evt.target.value);
  };

  const handleActiveChange = (evt) => {
    setActive(!active);
  };

  const handleSubmissionChange = (evt) => {
    setSubmission(!submission);
  };

  const handleEdit = (evt) => {
    if (evt) evt.preventDefault();
    return client
      .service("contests")
      .patch(props.contest.id, {
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

  const handleDelete = (evt) => {
    if (evt) evt.preventDefault();
    const confirmDialog = window.confirm("Are you sure?");
    if (confirmDialog) {
      return client
        .service("contests")
        .remove(props.contest.id)
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
            {`Edit ${props.contest.title}`}
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
              defaultValue={props.contest.title}
              onChange={handleTitleChange}
            />
            <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
              <InputLabel className={classes.label} id="select-label">
                Type
              </InputLabel>
              <Select labelId="select-label" value={type} onChange={handleTypeChange} autoWidth>
                <MenuItem value="alert">Alert</MenuItem>
                <MenuItem value="song">Song</MenuItem>
                <MenuItem value="review">Review</MenuItem>
              </Select>
            </FormControl>
            <Box display="flex">
              <Switch
                checked={active}
                onChange={handleActiveChange}
                classes={{
                  track: classes.switch_track,
                  switchBase: classes.switch_base,
                  colorPrimary: classes.switch_primary,
                }}
              />
              <div style={{ marginTop: "0.4rem" }}>
                <Typography variant="body1" className={classes.textLabel}>
                  Active Contest
                </Typography>
              </div>
            </Box>
            <Box display="flex">
              <Switch
                checked={submission}
                onChange={handleSubmissionChange}
                classes={{
                  track: classes.switch_track,
                  switchBase: classes.switch_base,
                  colorPrimary: classes.switch_primary,
                }}
              />
              <div style={{ marginTop: "0.4rem" }}>
                <Typography variant="body1" className={classes.textLabel}>
                  Allow Submissions
                </Typography>
              </div>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className={classes.submit}
                onClick={handleEdit}
                disabled={title === props.contest.title && submission === props.contest.submission && active === props.contest.active && type === props.contest.type}
              >
                Edit
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Button fullWidth type="submit" variant="contained" color="error" className={classes.deleteBtn} onClick={handleDelete}>
                Delete
              </Button>
            </Box>
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
    fontFamily: "Anton !important",
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
  deleteBtn: {
    marginTop: "1rem",
    color: "#fff",
    backgroundColor: "red",
    "&:hover": {
      backgroundColor: "red",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
  },
  formControl: {
    margin: "1rem",
    display: "flex",
  },
  label: {
    color: "#fff",
    "&.Mui-focused": {
      color: "#fff",
    },
  },
  dropdownStyle: {
    color: "#fff",
    backgroundColor: "#1d1d1d",
  },
  dropdownRoot: {
    color: "#fff",
  },
  dropdownSelect: {
    "&:before": {
      borderColor: "#fff",
    },
    "&:after": {
      borderColor: "#fff",
    },
  },
  dropdownIcon: {
    fill: "#fff",
  },
}));
