import React from "react";
import {
  AppBar,
  Toolbar,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Drawer,
  useMediaQuery,
  Box,
} from "@material-ui/core";
import Logo from "./assets/jammin.gif";
import { Menu } from "@material-ui/icons";
import discord from "./assets/discord.png";
import twitter from "./assets/twitter.png";
import soundcloud from "./assets/soundcloud.png";
import reddit from "./assets/reddit.png";
import youtube from "./assets/youtube.png";
import twitch from "./assets/twitch.png";

const mainLinks = [
  { title: `Home`, path: `/` },
  { title: `Vods`, path: `/vods` },
  { title: `Contest`, path: `/contest` },
  { title: `Merch`, path: `https://metathreads.com/collections/pokelawls` },
];
const socialLinks = [
  { title: `Twitch`, path: `https://twitch.tv/pokelawls` },
  { title: `Twitter`, path: `https://twitter.com/pokelawls` },
  { title: `Reddit`, path: `https://reddit.com/r/pokelawls` },
  { title: `Discord`, path: `https://discord.gg/pokelawls` },
  { title: `Youtube`, path: `https://youtube.com/c/pokelawls` },
  { title: `Soundcloud`, path: `https://soundcloud.com/pokelawls` },
];

export default function Navbar(props) {
  const { window } = props;
  const isMobile = useMediaQuery("(max-width: 800px)");
  const mobileClasses = mobileStyles();
  const classes = useStyles();

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <div className={mobileClasses.toolbar} />
      <Box
        alignItems="center"
        flexGrow={1}
        flexShrink={1}
        width="100%"
        justifyContent="center"
        display="flex"
        marginBottom="1rem"
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <a href="/">
            <img alt="" height="45px" src={Logo} />
          </a>
        </div>
      </Box>
      <Divider classes={{ root: mobileClasses.divider }} />
      <List>
        {mainLinks.map(({ title, path }) => (
          <ListItem
            key={title}
            component="a"
            href={path}
            className={mobileClasses.linkText}
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Divider classes={{ root: mobileClasses.divider }} />
      <List>
        {socialLinks.map(({ title, path }) => (
          <ListItem
            key={title}
            component="a"
            href={path}
            target="_blank"
            rel="noreferrer noopener"
            className={mobileClasses.linkText}
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Divider classes={{ root: mobileClasses.divider }} />
      <div style={{ marginTop: "1rem" }}>
        <Typography
          variant="caption"
          className={mobileClasses.content}
          style={{ padding: "14px" }}
        >
          <a
            href="https://twitter.com/overpowered"
            target="_blank"
            rel="noreferrer noopener"
            className={mobileClasses.linkText}
          >
            Made by OP with 💜
          </a>
        </Typography>
      </div>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return isMobile ? (
    <div style={{ display: "flex" }}>
      <AppBar
        position="static"
        color="inherit"
        className={mobileClasses.appBar}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={mobileClasses.menuButton}
          >
            <Menu />
          </IconButton>
          <Box
            alignItems="center"
            flexGrow={1}
            flexShrink={1}
            width="100%"
            justifyContent="center"
            display="flex"
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <a href="/">
                <img alt="" height="45px" src={Logo} />
              </a>
            </div>
          </Box>
        </Toolbar>
      </AppBar>
      <nav className={mobileClasses.drawer} aria-label="navigation">
        <Drawer
          container={container}
          variant="temporary"
          anchor={"left"}
          open={drawerOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: mobileClasses.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </div>
  ) : (
    <div className={classes.navDisplayFlex}>
      <Box
        alignItems="stretch"
        display="flex"
        flexWrap="nowrap"
        height="100%"
        width="100%"
      >
        <Box
          alignItems="stretch"
          justifyContent="flex-start"
          width="100%"
          display="flex"
          flexShrink={1}
          flexGrow={1}
          flexWrap="nowrap"
        >
          <Box
            marginLeft="1rem"
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
            height="100%"
          >
            <div className={classes.linkButton}>
              <Box
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <a
                  href="https://twitter.com/pokelawls"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img alt="" height="auto" width="35px" src={twitter} />
                </a>
              </Box>
            </div>
            <div className={classes.linkButton}>
              <Box
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <a
                  href="https://discord.gg/chUMEPR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img alt="" height="auto" width="45px" src={discord} />
                </a>
              </Box>
            </div>
            <div className={classes.linkButton}>
              <Box
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <a
                  href="https://soundcloud.com/pokelawls"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img alt="" height="auto" width="45px" src={soundcloud} />
                </a>
              </Box>
            </div>
            <div className={classes.linkButton}>
              <Box
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <a
                  href="https://reddit.com/r/pokelawls"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img alt="" height="auto" width="42px" src={reddit} />
                </a>
              </Box>
            </div>
            <div className={classes.linkButton}>
              <Box
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <a
                  href="https://youtube.com/c/pokelawls"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img alt="" height="auto" width="45px" src={youtube} />
                </a>
              </Box>
            </div>
          </Box>
        </Box>
        <Box
          alignItems="center"
          flexGrow={1}
          flexShrink={1}
          width="100%"
          justifyContent="center"
          display="flex"
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a href="/">
              <img alt="" height="45px" src={Logo} />
            </a>
          </div>
        </Box>
        <Box
          alignItems="center"
          display="flex"
          flexGrow={1}
          flexShrink={1}
          width="100%"
          justifyContent="flex-end"
          marginRight="1rem"
        >
          <Box display="flex" marginRight="1rem">
            <a href="/contest" className={classes.linkText}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box marginLeft="1rem">
                  <Typography>Contest</Typography>
                </Box>
              </Box>
            </a>
          </Box>
          <Box display="flex" marginRight="1rem">
            <a href="/vods" className={classes.linkText}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box marginLeft="1rem">
                  <Typography>Vods</Typography>
                </Box>
              </Box>
            </a>
          </Box>
          <div className={classes.linkButton}>
            <Box height="100%">
              <a
                href="https://twitch.tv/pokelawls"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.linkText}
              >
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img alt="" height="auto" width="38px" src={twitch} />
                  <Box marginLeft="0.3rem">
                    <Typography>Watch me Live</Typography>
                  </Box>
                </Box>
              </a>
            </Box>
          </div>
        </Box>
      </Box>
    </div>
  );
}

const mobileStyles = makeStyles((theme) => ({
  appBar: {
    boxShadow: "none",
    backgroundColor: "inherit",
  },
  divider: {
    backgroundColor: "#868686",
  },
  drawer: {
    width: "10rem",
    flexShrink: 0,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: "#fff",
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: "10rem",
    backgroundColor: "#0e0e10",
    color: "#fff",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  linkText: {
    textDecoration: `none`,
    color: `#fff`,
    "&:hover": {
      opacity: "50%",
    },
  },
}));

const useStyles = makeStyles({
  navDisplayFlex: {
    display: `flex`,
    width: "100%",
    height: "3rem",
    flexShrink: 0,
    zIndex: 1000,
    backgroundColor: "#1d1d1d",
  },
  button: {
    marginLeft: "0.5rem",
    color: `#fff`,
    "&:hover": {
      opacity: "0.7",
    },
    textDecoration: `none`,
    textTransform: "none",
  },
  primaryButton: {
    backgroundColor: "#3c70ff",
    marginRight: "0.5rem",
    "&:hover": {
      backgroundColor: "#3c70ff",
    },
  },
  secondaryButton: {
    backgroundColor: "#333536",
    "&:hover": {
      backgroundColor: "#333536",
    },
  },
  alertButton: {
    backgroundColor: "#e01d1d",
    "&:hover": {
      backgroundColor: "#e01d1d",
    },
  },
  linkButton: {
    marginLeft: "0.3rem",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  linkText: {
    textDecoration: `none`,
    color: `#fff`,
    "&:hover": {
      opacity: "50%",
    },
  },
});
