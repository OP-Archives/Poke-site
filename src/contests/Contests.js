import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, Typography, Button, SvgIcon, Paper } from "@mui/material";
import logo from "../assets/contestlogo.png";
import SimpleBar from "simplebar-react";
import client from "./client";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import IsolatedModal from "./IsolatedModal";

const OAUTH_LOGIN = `${process.env.REACT_APP_CONTESTS_API}/oauth/twitch`;

export default function Contests(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [contests, setContests] = useState(undefined);
  const [submittedContests, setSubmittedContests] = useState([]);
  const { user } = props;

  useEffect(() => {
    document.title = "Contests - Poke";
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
        .then((res) => {
          setContests(res.data);
        });
    };
    fetchContests();
    return;
  }, []);

  //If user has submitted in a contest, store in state to allow editing.
  useEffect(() => {
    if (!user) return;
    const fetchSubmittedContests = async () => {
      await client
        .service("submissions")
        .find({
          query: {
            userId: user.id,
          },
        })
        .then((res) => {
          setSubmittedContests(res);
        });
    };
    fetchSubmittedContests();
    return;
  }, [user]);

  const login = () => {
    window.location.href = OAUTH_LOGIN;
  };

  if (user === undefined || contests === undefined) return <Loading />;

  const prevContests = contests.filter((contest) => !contest.active);
  const ongoingContests = contests.filter((contest) => contest.active);

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1, flexDirection: "column", width: "100%" }}>
        <Box sx={{ p: 2, width: "100%" }}>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Box sx={{ mt: 2, minWidth: `${isMobile ? "100%" : "50%"}` }}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <img style={{ height: "auto" }} src={logo} alt="" />
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <Typography variant="h6">{`🥇 $250 USD & VIP`}</Typography>
                    <Typography variant="h6">{`🥈 $150 USD`}</Typography>
                    <Typography variant="h6">{`🥉 $25 USD`}</Typography>
                  </Box>
                  <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {!user && (
                      <Button
                        variant="contained"
                        onClick={login}
                        startIcon={
                          <SvgIcon>
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                          </SvgIcon>
                        }
                      >
                        Connect
                      </Button>
                    )}

                    {user && (user.type === "admin" || user.type === "mod") && <IsolatedModal type={"Creation"} user={user} />}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h3" color="primary" sx={{ fontFamily: "Anton", textTransform: "uppercase" }}>
                  Contests
                </Typography>
              </Box>

              <Box sx={{ mt: 2, width: `${isMobile ? "100%" : "50%"}` }}>
                {ongoingContests.map((data, _) => {
                  const userSubmission = submittedContests.find((submission) => submission.contestId === data.id);
                  return (
                    <Paper key={data.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 4, mt: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: "Anton" }} color="textSecondary">{`${new Date(data.createdAt).toLocaleDateString()}`}</Typography>
                        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase" }} color="primary">{`${data.type} Contest`}</Typography>
                        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 2 }}>{`${data.title}`}</Typography>
                        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 2 }} color="primary">{`${data.submissions.length} Submissions`}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
                        {user && (user.type === "admin" || user.type === "mod") && (
                          <>
                            <Box sx={{ p: 1 }}>
                              <Button href={`/contests/${data.id}/manage`} variant="contained" color="error">
                                Manage
                              </Button>
                            </Box>
                            <Box sx={{ p: 1 }}>
                              <IsolatedModal type={"Edit"} user={user} contest={data} />
                            </Box>
                          </>
                        )}
                        <Box sx={{ p: 1 }}>
                          <IsolatedModal type={userSubmission ? "Modify" : "Submit"} user={user} contest={data} submission={userSubmission} />
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h3" color="red" sx={{ fontFamily: "Anton", textTransform: "uppercase" }}>
                  Previous Contests
                </Typography>
              </Box>

              <Box sx={{ mt: 2, width: `${isMobile ? "100%" : "50%"}` }}>
                {prevContests.map((data, _) => {
                  return (
                    <Paper key={data.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 4, mt: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: "Anton" }} color="textSecondary">{`${new Date(data.createdAt).toLocaleDateString()}`}</Typography>
                        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase" }} color="primary">{`${data.type} Contest`}</Typography>
                        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 2 }}>{`${data.title}`}</Typography>
                        <Typography variant="h5" sx={{ fontFamily: "Anton", textTransform: "uppercase", mt: 2 }} color="primary">{`${data.submissions.length} Submissions`}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
                        {user && (user.type === "admin" || user.type === "mod") && (
                          <>
                            <Box sx={{ p: 1 }}>
                              <Button href={`/contests/${data.id}/manage`} variant="contained" color="error">
                                Manage
                              </Button>
                            </Box>
                            <Box sx={{ p: 1 }}>
                              <IsolatedModal type={"Edit"} user={user} contest={data} />
                            </Box>
                          </>
                        )}
                        <Box sx={{ p: 1 }}>
                          <Button href={`/contests/${data.id}/winners`} variant="contained">
                            Winners
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </SimpleBar>
  );
}
