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
import ErrorBoundary from "./ErrorBoundary.js";
import AdSense from "react-adsense";

export default function Contest(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const classes = useStyles();
  const [contests, setContests] = useState(undefined);
  const [prevContests, setPrevContests] = useState([]);
  const [ongoingContests, setOngoingContests] = useState([]);
  const [createModal, setCreateModal] = React.useState(false);

  useEffect(() => {
    document.title = "Sub Alert Contest - Poke";
    const fetchContests = async () => {
      await client
        .service("contests")
        .find({
          query: {
            $sort: {
              id: 1,
            },
          },
        })
        .then((data) => {
          setContests(data.data);
        });
    };
    fetchContests();
    return;
  }, []);

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
            disabled={!props.contest.submission || !props.user}
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
              <Submission user={props.user} contest={props.contest} />
            ) : props.type === "Edit" ? (
              <Edit user={props.user} contest={props.contest} />
            ) : (
              <></>
            )}
          </div>
        </Modal>
      </>
    );
  };

  useEffect(() => {
    if (!contests) return;

    const fetchSubmissionLength = async () => {
      for (let contest of contests) {
        await client
          .service("submissions")
          .find({
            query: {
              contest_id: contest.id,
            },
          })
          .then((data) => {
            contest.submissionTotal = data.length;
          });
      }
    };

    const transFormContests = async () => {
      await fetchSubmissionLength();
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
                  <Typography variant="h5" className={classes.title}>
                    {`${data.title} - ${data.submissionTotal} Submissions`}
                  </Typography>
                  <Box display="flex">
                    {props.user ? (
                      props.user.type === "admin" ||
                      props.user.type === "mod" ? (
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
                            user={props.user}
                            contest={data}
                          />
                        </>
                      ) : (
                        <></>
                      )
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
            <div key={data.id} className={classes.ongoingContestContainer}>
              <div className={classes.inner}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h5" className={classes.title}>
                    {`${data.title} - ${data.submissionTotal} Submissions`}
                  </Typography>
                  <Box display="flex">
                    {props.user ? (
                      props.user.type === "admin" ||
                      props.user.type === "mod" ? (
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
                            user={props.user}
                            contest={data}
                          />
                        </>
                      ) : (
                        <></>
                      )
                    ) : (
                      <></>
                    )}
                    <IsolatedModal
                      type={"Submit"}
                      user={props.user}
                      contest={data}
                    />
                  </Box>
                </Box>
              </div>
            </div>
          );
        })
      );
    };
    transFormContests();
    return;
  }, [contests, classes, props.user]);

  const handleCreateModalOpen = () => {
    setCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setCreateModal(false);
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
    <div className={classes.parent}>
      <SimpleBar className={classes.scroll}>
      <div id="top-ad-banner" className={classes.topAdBanner}>
          <ErrorBoundary>
            {isMobile ? (
              <AdSense.Google
                key="top-ad"
                client="ca-pub-8093490837210586"
                slot="3667265818"
                style={{
                  border: "0px",
                  verticalAlign: "bottom",
                  width: "300px",
                  height: "100px",
                }}
                format=""
              />
            ) : (
              <AdSense.Google
                key="top-ad"
                client="ca-pub-8093490837210586"
                slot="3667265818"
                style={{
                  border: "0px",
                  verticalAlign: "bottom",
                  width: "728px",
                  height: "90px",
                }}
                format=""
              />
            )}
          </ErrorBoundary>
        </div>
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
                  {`🥇 $250 USD & VIP 🥈$150 USD 🥉 $25 USD`}
                </Typography>
                <img src={sip} className={classes.image} alt="" />
                <Box display="flex" justifyContent="center" marginTop="1rem">
                  {!props.user ? (
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
                      {props.user.type === "admin" ||
                      props.user.type === "mod" ? (
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
                              <Creation user={props.user} />
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
          {ongoingContests.length > 0 ? (
            <>
              <Typography
                variant="h3"
                className={classes.title}
                style={{ marginBottom: "1rem", color: "green" }}
              >
                CONTESTS
              </Typography>
              {ongoingContests}
            </>
          ) : (
            <></>
          )}
          {prevContests.length > 0 ? (
            <>
              <Typography
                variant="h3"
                className={classes.title}
                style={{ marginBottom: "1rem", color: "#ff0000" }}
              >
                PREVIOUS CONTESTS
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
  topAdBanner: {
    textAlign: "center",
    marginBottom: "0px",
    marginTop: "30px",
    border: "0pt none",
  },
});
