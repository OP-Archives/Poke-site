import React, { useState, useEffect } from "react";
import {
  makeStyles,
  useMediaQuery,
  Box,
  Typography,
  Button,
  CircularProgress,
  Link,
  Modal,
} from "@material-ui/core";
import logo from "./assets/contestlogo.png";
import SimpleBar from "simplebar-react";
import sip from "./assets/sip.png";
import loadingLogo from "./assets/jammin.gif";
import client from "./client";
import Creation from "./creation";
import Submission from "./submission";
import Edit from "./edit";

export default function Contest(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const classes = useStyles();
  const [user, setUser] = useState(undefined);
  const [contests, setContests] = useState(undefined);
  const [prevContests, setPrevContests] = useState(undefined);
  const [ongoingContests, setOngoingContests] = useState(undefined);
  const [createModal, setCreateModal] = React.useState(false);

  useEffect(() => {
    client.authenticate().catch(() => setUser(null));

    client.on("authenticated", (paramUser) => {
      setUser(paramUser.user);
    });

    client.on("logout", () => {
      setUser(null);
      window.location.href = "/";
    });

    return;
  }, [user]);

  useEffect(() => {
    document.title = "Sub Alert Contest - Poke";
    const fetchContests = async () => {
      await client
        .service("contests")
        .find()
        .then((data) => {
          setContests(data.data);
        });
    };
    fetchContests();
    return;
  }, [user]);

  const login = () => {
    window.location.href = `https://api.poke.gg/oauth/twitch`;
  };

  const IsolatedModal = (props) => {
    const [modal, setModal] = React.useState(false);

    const handleOpen = () => {
      setModal(true);
    };

    const handleClose = () => {
      setModal(false);
    };

    return (
      <>
        {props.type === "Edit" ? (
          <Button
            onClick={handleOpen}
            variant="contained"
            className={classes.editBtn}
          >
            Edit
          </Button>
        ) : (
          <Button
            disabled={!props.contest.submission}
            onClick={handleOpen}
            variant="contained"
            className={classes.btn}
          >
            Submit
          </Button>
        )}
        <Modal open={modal} onClose={handleClose}>
          <div className={`${classes.modalContent} ${classes.modal}`}>
            {props.type === "Submit" ? (
              <Submission user={props.user} contestId={props.contest.id} />
            ) : props.type === "Edit" ? (
              <Edit user={props.user} contestId={props.contest.id} />
            ) : (
              <></>
            )}
          </div>
        </Modal>
      </>
    );
  };

  useEffect(() => {
    if (!contests || !user) return;

    const transFormContests = () => {
      const prevContestsData = contests.filter((contest) => !contest.active);
      setPrevContests(
        prevContestsData.map((data, index) => {
          return (
            <div key={data.id} className={classes.contestContainer}>
              <div className={classes.inner}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h4" className={classes.title}>
                    {data.title}
                  </Typography>
                  <Box display="flex">
                    {user.type === "admin" ? (
                      <>
                        <Button
                          component={Link}
                          href={`/contest/${data.id}/manage`}
                          variant="contained"
                          className={classes.adminBtn}
                        >
                          Manage
                        </Button>
                        <IsolatedModal
                          type={"Edit"}
                          user={user}
                          contest={data}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                    <Button
                      component={Link}
                      href={`/contest/${data.id}/winners`}
                      variant="contained"
                      className={classes.btn}
                    >
                      Winners
                    </Button>
                  </Box>
                </Box>
              </div>
            </div>
          );
        })
      );
      const ongoingContestData = contests.filter((contest) => contest.active);
      setOngoingContests(
        ongoingContestData.map((data, index) => {
          return (
            <>
              <div key={data.id} className={classes.ongoingContestContainer}>
                <div className={classes.inner}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h4" className={classes.title}>
                      {data.title}
                    </Typography>
                    <Box display="flex">
                      {user.type === "admin" ? (
                        <>
                          <Button
                            component={Link}
                            href={`/contest/${data.id}/manage`}
                            variant="contained"
                            className={classes.adminBtn}
                          >
                            Manage
                          </Button>
                          <IsolatedModal
                            type={"Edit"}
                            user={user}
                            contest={data}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                      <IsolatedModal
                        type={"Submit"}
                        user={user}
                        contest={data}
                      />
                    </Box>
                  </Box>
                </div>
              </div>
            </>
          );
        })
      );
    };
    transFormContests();
    return;
  }, [contests, classes, user]);

  const handleCreateModalOpen = () => {
    setCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setCreateModal(false);
  };

  if (user === undefined)
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
      <SimpleBar className={classes.scroll}>
        <div className={isMobile ? classes.mobileContainer : classes.container}>
          <div className={classes.box}>
            <div className={classes.inner}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <img src={logo} className={classes.banner} alt="" />
              </Box>
              <div>
                <Typography
                  className={isMobile ? classes.mobileCaption : classes.caption}
                >
                  🥇 $200 USD 🥈$50 USD 🥉 $25 USD
                </Typography>
                <img src={sip} className={classes.image} alt="" />
                <Box display="flex" justifyContent="center" marginTop="1rem">
                  {!user ? (
                    <Button
                      variant="contained"
                      onClick={login}
                      className={classes.connect}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexGrow: "0",
                          alignItems: "center",
                        }}
                      >
                        <svg
                          className={classes.twitchIcon}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="40"
                          viewBox="0 0 17 20"
                          fill="none"
                        >
                          <path
                            d="M3.54167 0L0 3.57143V16.4286H4.25V20L7.79167 16.4286H10.625L17 10V0H3.54167ZM15.5833 9.28571L12.75 12.1429H9.91667L7.4375 14.6429V12.1429H4.25V1.42857H15.5833V9.28571Z"
                            fill="white"
                          />
                          <path
                            d="M13.4584 3.92847H12.0417V8.21418H13.4584V3.92847Z"
                            fill="white"
                          />
                          <path
                            d="M9.56242 3.92847H8.14575V8.21418H9.56242V3.92847Z"
                            fill="white"
                          />
                        </svg>
                        <div style={{ flexGrow: "0" }}>Connect</div>
                      </div>
                    </Button>
                  ) : (
                    <Box display="flex">
                      {user.type === "admin" ? (
                        <>
                          <Button
                            variant="contained"
                            className={classes.btn}
                            onClick={handleCreateModalOpen}
                          >
                            Create Contest
                          </Button>
                          <Modal
                            open={createModal}
                            onClose={handleCreateModalClose}
                            aria-labelledby="Create Contest"
                            aria-describedby="Create a Contest"
                          >
                            <div
                              className={`${classes.modalContent} ${classes.modal}`}
                            >
                              <Creation user={user} />
                            </div>
                          </Modal>
                        </>
                      ) : (
                        <></>
                      )}
                    </Box>
                  )}
                </Box>
              </div>
            </div>
          </div>
          {contests ? (
            <>
              <Typography
                variant="h5"
                className={classes.title}
                style={{ marginBottom: "1rem" }}
              >
                ACTIVE CONTESTS:
              </Typography>
              {ongoingContests}
              <Typography
                variant="h5"
                className={classes.title}
                style={{ marginBottom: "1rem" }}
              >
                PREVIOUS CONTESTS:
              </Typography>
              {prevContests}
            </>
          ) : (
            <></>
          )}
        </div>
      </SimpleBar>
    </div>
  );
}

const useStyles = makeStyles({
  parent: {
    textAlign: "center",
    marginTop: "3rem",
    height: "calc(100% - 5rem)",
    width: "100%",
  },
  scroll: {
    height: "100%",
    position: "relative",
  },
  banner: {
    maxHeight: "300px",
  },
  container: {
    paddingRight: "35rem",
    paddingLeft: "35rem",
  },
  mobileContainer: {
    paddingRight: "1rem",
    paddingLeft: "1rem",
  },
  box: {
    backgroundColor: "#1d1d1d",
    borderLeft: "1px solid #dbffcf",
    borderRight: "1px solid #dbffcf",
    borderTop: "1px solid #dbffcf",
    borderBottom: "1px solid #dbffcf",
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
  caption: {
    fontWeight: "550",
  },
  mobileCaption: {
    fontWeight: "550",
    fontSize: "12px",
  },
  right: {
    marginLeft: "3rem",
    maxHeight: "300px",
    maxWidth: "500px",
  },
  mobileRight: {
    marginLeft: "1rem",
    maxHeight: "70px",
    maxWidth: "70px",
  },
  image: {
    maxHeight: "75px",
    maxWidth: "75px",
    height: "auto",
  },
  connect: {
    backgroundColor: "rgb(145, 70, 255)",
    color: `#fff`,
    "&:hover": {
      backgroundColor: "rgb(145, 70, 255)",
      opacity: "0.7",
    },
    whiteSpace: "nowrap",
    textTransform: "none",
    borderRadius: "1rem",
    marginTop: "2rem",
  },
  twitchIcon: {
    marginRight: "0.5rem",
  },
  contestContainer: {
    backgroundColor: "#1d1d1d",
    borderLeft: "1px solid hsla(0,0%,100%,.1)",
    borderRight: "1px solid hsla(0,0%,100%,.1)",
    borderTop: "1px solid hsla(0,0%,100%,.1)",
    borderBottom: "1px solid hsla(0,0%,100%,.1)",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    marginBottom: "2rem",
    paddingTop: "1rem",
    paddingBottom: "1rem",
  },
  ongoingContestContainer: {
    backgroundColor: "#1d1d1d",
    borderLeft: "1px solid #dbffcf",
    borderRight: "1px solid #dbffcf",
    borderTop: "1px solid #dbffcf",
    borderBottom: "1px solid #dbffcf",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    marginBottom: "2rem",
    paddingTop: "1rem",
    paddingBottom: "1rem",
  },
  primaryBtn: {
    backgroundColor: "#0ed600",
    color: `#fff`,
    "&:hover": {
      backgroundColor: "#0ed600",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
    whiteSpace: "nowrap",
    textTransform: "none",
    borderRadius: "1rem",
    textDecoration: "none",
  },
  btn: {
    backgroundColor: "#008230",
    color: `#fff`,
    "&:hover": {
      backgroundColor: "#008230",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
    whiteSpace: "nowrap",
    textTransform: "none",
    borderRadius: "1rem",
    textDecoration: "none",
  },
  adminBtn: {
    marginRight: "1rem",
    backgroundColor: "#ff0000",
    color: `#fff`,
    "&:hover": {
      backgroundColor: "#ff0000",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
    whiteSpace: "nowrap",
    textTransform: "none",
    borderRadius: "1rem",
  },
  editBtn: {
    marginRight: "1rem",
    backgroundColor: "#292828",
    color: `#fff`,
    "&:hover": {
      backgroundColor: "#292828",
      opacity: "0.7",
      textDecoration: "none",
      color: `#fff`,
    },
    whiteSpace: "nowrap",
    textTransform: "none",
    borderRadius: "1rem",
  },
  modalContent: {
    position: "absolute",
    width: "400px",
    backgroundColor: "#1d1d1d",
    outline: "none",
  },
  modal: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});
