import React, { useState, useEffect, useMemo } from "react";
import { Typography, Button, Box, useMediaQuery, Paper, Switch, Input } from "@mui/material";
import client from "./client";
import Redirect from "../utils/Redirect";
import { useParams } from "react-router-dom";
import Loading from "../utils/Loading";
import SimpleBar from "simplebar-react";
import Footer from "../utils/Footer";
import logo from "../assets/contestlogo.png";
import YoutubePlayer from "./YoutubePlayer";
import TikTokPlayer from "./TikTokPlayer";
import { Tweet } from "react-twitter-widgets";
import CustomLink from "../utils/CustomLink";
import debounce from "lodash.debounce";
import Winners from "./winnerUI";

export default function Manage(props) {
  const { user } = props;
  const params = useParams();
  const contestId = params.contestId;
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [contest, setContest] = useState(undefined);
  const [submissions, setSubmissions] = useState(undefined);
  const [submission, setSubmission] = useState(undefined);
  const [ui, setUi] = useState("all");

  useEffect(() => {
    document.title = `Contest ${contestId} - Poke`;
    const fetchContest = async () => {
      await client
        .service("contests")
        .get(contestId)
        .then((data) => {
          setContest(data);
        })
        .catch(() => {
          setContest(null);
        });
    };
    fetchContest();
    return;
  }, [contestId]);

  useEffect(() => {
    setSubmissions(undefined);
    setSubmission(undefined);
    const fetchSubmissions = async () => {
      const res = await client
        .service("submissions")
        .find({
          query: {
            contestId: contestId,
            $sort: {
              id: 1,
            },
          },
        })
        .then((res) => res)
        .catch((e) => {
          console.error(e);
          return null;
        });

      switch (ui) {
        case "all":
          setSubmissions(res);
          break;
        case "denied":
          setSubmissions(res.filter((submission) => submission.status === "denied"));
          break;
        case "unapproved":
          setSubmissions(res.filter((submission) => submission.status === ""));
          break;
        case "approved":
          setSubmissions(res.filter((submission) => submission.status === "approved"));
          break;
        case "winners":
          setSubmissions(res.filter((submission) => submission.winner));
          break;
        default:
          setSubmissions(res);
      }
    };
    fetchSubmissions();
  }, [ui, contestId]);

  useEffect(() => {
    if (!submissions) return;
    setSubmission(submissions.length > 0 ? submissions[0] : null);
  }, [submissions]);

  const nextSubmission = (_) => {
    const nextIndex = submissions.findIndex((argSubmission) => argSubmission.id === submission.id) + 1;
    if (!submissions[nextIndex]) return;

    setSubmission(submissions[nextIndex]);
  };

  const prevSubmission = (_) => {
    const prevIndex = submissions.findIndex((argSubmission) => argSubmission.id === submission.id) - 1;
    if (!submissions[prevIndex]) return;

    setSubmission(submissions[prevIndex]);
  };

  const approve = async (_) => {
    await client
      .service("submissions")
      .patch(submission.id, {
        status: "approved",
      })
      .then((argSubmission) => {
        const index = submissions.findIndex((data) => data.id === argSubmission.id);
        submissions[index] = argSubmission;
        setSubmission(argSubmission);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const unapprove = async (_) => {
    const confirmDialog = window.confirm("Are you sure?");
    if (!confirmDialog) return;
    await client
      .service("submissions")
      .patch(submission.id, {
        status: "",
      })
      .then((argSubmission) => {
        const index = submissions.findIndex((data) => data.id === argSubmission.id);
        submissions[index] = argSubmission;
        setSubmission(argSubmission);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const deny = async (_) => {
    await client
      .service("submissions")
      .patch(submission.id, {
        status: "denied",
      })
      .then((argSubmission) => {
        const index = submissions.findIndex((data) => data.id === argSubmission.id);
        submissions[index] = argSubmission;
        setSubmission(argSubmission);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const switchWinner = async (_) => {
    if (submission.status !== "approved") return;
    await client
      .service("submissions")
      .patch(submission.id, {
        winner: !submission.winner,
      })
      .then((argSubmission) => {
        const index = submissions.findIndex((data) => data.id === argSubmission.id);
        submissions[index] = argSubmission;
        setSubmission(argSubmission);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const ban = async (_) => {
    const confirmDialog = window.confirm("Are you sure?");
    if (!confirmDialog) return;
    await client
      .service("users")
      .patch(submission.userId, {
        banned: true,
      })
      .catch((e) => {
        console.error(e);
      });

    await client
      .service("submissions")
      .patch(submission.id, {
        status: "denied",
      })
      .then((argSubmission) => {
        const index = submissions.findIndex((data) => data.id === argSubmission.id);
        submissions[index] = argSubmission;
        setSubmission(argSubmission);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const remove = async (_) => {
    const confirmDialog = window.confirm("Are you sure?");
    if (!confirmDialog) return;
    await client
      .service("submissions")
      .remove(submission.id)
      .then(() => {
        const index = submissions.findIndex((argSubmission) => argSubmission.id === submission.id);
        if (index === -1) return;
        submissions.splice(index, 1);
        setSubmission(submissions[index] ? submissions[index] : submissions[index - 1] ? submissions[index - 1] : submissions[index + 1] ? submissions[index + 1] : undefined);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const submissionIdDebounce = useMemo(() => {
    const submissionIdChange = (evt) => {
      if (evt.target.value.length === 0) return;
      const value = Number(evt.target.value);
      if (isNaN(value)) return;
      if (value < 0) return;

      const index = submissions.findIndex((argSubmission) => argSubmission.id === evt.target.value);
      if (index === -1) return;

      setSubmission(submissions[index]);
    };
    return debounce(submissionIdChange, 600);
  }, [submissions]);

  const indexDebounce = useMemo(() => {
    const indexChange = (evt) => {
      if (evt.target.value.length === 0) return;
      const value = Number(evt.target.value) - 1;
      if (isNaN(value)) return;
      if (value < 0) return;

      if (!submissions[value]) return;
      setSubmission(submissions[value]);
    };
    return debounce(indexChange, 600);
  }, [submissions]);

  if (user === undefined || contest === undefined) return <Loading />;
  if (!contest) return <Redirect to="/contests" />;
  if (!user) return <Redirect to="/contests" />;
  if (user.type !== "mod" && user.type !== "admin") return <Redirect to="/contests" />;

  const currentIndex = submissions && submission ? submissions.findIndex((argSubmission) => argSubmission.id === submission.id) + 1 : undefined;

  return (
    <SimpleBar style={{ minHeight: 0, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: `${isMobile ? "100%" : "75%"}` }}>
          <Paper sx={{ pl: 6, pr: 6, pt: 2, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
              <img style={{ height: "auto" }} src={logo} alt="" />
              <Box sx={{ display: "flex", mt: 2, flexDirection: isMobile ? "column" : "row" }}>
                <Button sx={{ m: 1 }} variant="contained" onClick={(_) => setUi("all")}>
                  ALL
                </Button>
                <Button sx={{ m: 1 }} variant="contained" onClick={(_) => setUi("denied")}>
                  Denied
                </Button>
                <Button sx={{ m: 1 }} variant="contained" onClick={(_) => setUi("unapproved")}>
                  Unapproved
                </Button>
                <Button sx={{ m: 1 }} variant="contained" onClick={(_) => setUi("approved")}>
                  Approved
                </Button>
                <Button sx={{ m: 1 }} variant="contained" onClick={(_) => setUi("winners")}>
                  Winners
                </Button>
              </Box>

              <Box sx={{ display: "flex", mt: 1, flexDirection: "column", width: "100%", height: "100%" }}>
                {submissions === undefined && <Loading />}
                {submissions && submission && ui !== "winners" && (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ mr: 1 }}>{`Submission ID:`}</Typography>
                        <Input
                          key={submission.id}
                          type="text"
                          sx={{ width: `${submission.id.length * 12}px`, fontWeight: "550", fontSize: "1.25rem" }}
                          autoCapitalize="off"
                          autoCorrect="off"
                          autoComplete="off"
                          disableUnderline
                          defaultValue={submission.id}
                          onFocus={(e) => e.target.select()}
                          onChange={submissionIdDebounce}
                        />
                      </Box>
                      <Box sx={{ display: "flex" }}>
                        <Typography variant="h6" sx={{ mr: 0.5 }}>{`Status:`}</Typography>
                        <Typography variant="h6" color={submission.status === "approved" ? "primary" : submission.status === "" ? "textSecondary" : "error"} sx={{ textTransform: "uppercase" }}>{`${
                          submission.status === "" ? "Not Approved" : submission.status
                        }`}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Input
                          key={currentIndex}
                          type="text"
                          sx={{ width: `${submissions.length.toString().length * 12}px`, fontWeight: "550", fontSize: "1.25rem", mr: 1 }}
                          inputProps={{ sx: { textAlign: "center" } }}
                          autoCapitalize="off"
                          autoCorrect="off"
                          autoComplete="off"
                          disableUnderline
                          defaultValue={currentIndex}
                          onFocus={(e) => e.target.select()}
                          onChange={indexDebounce}
                        />
                        <Typography variant="h6">{`/ ${submissions.length}`}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", width: "100%", justifyContent: "space-evenly", alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
                      <Button variant="contained" onClick={prevSubmission}>{`<`}</Button>

                      {contest.type === "alert" && (submission.video?.source === "youtube" || !submission.video.source) && (
                        <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                          <YoutubePlayer submission={submission} />
                        </Box>
                      )}

                      {contest.type === "alert" && submission.video?.source === "tiktok" && (
                        <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "22%" }}>
                          <TikTokPlayer submission={submission} />
                        </Box>
                      )}

                      {contest.type === "clips" && (
                        <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                          <iframe
                            title={submission.video.id}
                            src={`https://clips.twitch.tv/embed?clip=${submission.video.id}&parent=${window.location.hostname}`}
                            height="500px"
                            width="100%"
                            allowFullScreen={true}
                            preload="auto"
                            frameBorder="0"
                          />
                        </Box>
                      )}

                      {contest.type === "review" && (
                        <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            <Tweet tweetId={submission.video.id} options={{ align: "center" }} />
                          </Box>
                        </Box>
                      )}

                      {contest.type === "song" && (
                        <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            <iframe
                              title="SoundCloud Player"
                              width="100%"
                              height="160"
                              scrolling="no"
                              frameBorder="no"
                              allow="autoplay"
                              src={`https://w.soundcloud.com/player/?url=${submission.video.link.replace(
                                /(www\.|m\.)/,
                                ""
                              )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                            />
                          </Box>
                        </Box>
                      )}

                      <Button variant="contained" onClick={nextSubmission}>{`>`}</Button>
                    </Box>
                  </>
                )}
              </Box>

              {submissions && submission && ui !== "winners" && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", mt: 1, width: isMobile ? "100%" : "60%" }}>
                  <Typography variant="h5">{`${submission.title}`}</Typography>
                  <Typography variant="h5" color="primary">{`${submission.display_name}`}</Typography>
                  <CustomLink href={submission.video.link} target="_blank" rel="noreferrer noopener" color="textSecondary">
                    <Typography variant="caption" noWrap>{`${submission.video.link}`}</Typography>
                  </CustomLink>
                  {submission.video.start != null && submission.video.end != null && <Typography variant="h5">{`${toHHMMSS(submission.video.start)} - ${toHHMMSS(submission.video.end)}`}</Typography>}
                  <Typography variant="caption" sx={{ wordBreak: "break-word" }}>
                    {`${submission.comment}`}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {submission.status === "denied" && (
                      <Button sx={{ m: 0.5 }} variant="outlined" onClick={unapprove}>
                        {`Un-Deny`}
                      </Button>
                    )}
                    {submission.status === "approved" && (
                      <>
                        <Button sx={{ m: 0.5 }} variant="outlined" onClick={unapprove} color="error">
                          {`Un-Approve`}
                        </Button>
                        <Switch checked={submission.winner} onChange={switchWinner} />
                        <Typography variant="h6">Winner</Typography>
                      </>
                    )}
                    {submission.status === "" && (
                      <>
                        <Button sx={{ m: 0.5 }} variant="outlined" onClick={approve}>
                          {`Approve`}
                        </Button>
                        <Button sx={{ m: 0.5 }} variant="outlined" onClick={deny} color="error">
                          {`Deny`}
                        </Button>
                      </>
                    )}
                  </Box>
                  <Box sx={{ display: "flex" }}>
                    <Button sx={{ m: 0.5 }} variant="outlined" onClick={remove} color="error">
                      {`Remove`}
                    </Button>
                    <Button sx={{ m: 0.5 }} variant="outlined" onClick={ban} color="error">
                      {`Ban User`}
                    </Button>
                  </Box>
                </Box>
              )}

              {submissions && ui === "winners" && <Winners contest={contest} submissions={submissions} />}
            </Box>
            <Footer />
          </Paper>
        </Box>
      </Box>
    </SimpleBar>
  );
}

const toHHMMSS = (secs) => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};
