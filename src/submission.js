import React, { useEffect } from "react";
import {
  makeStyles,
  Typography,
  Link,
  Container,
  Button,
  Menu,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@material-ui/core";
import SimpleBar from "simplebar-react";
import loadingLogo from "./assets/jammin.gif";

export default function Submission(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const classes = useStyles();

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
    <div className={classes.parent}>
      <SimpleBar style={{height: "100%"}}>

      </SimpleBar>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  parent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
}));
