import React, { useState } from "react";
import client from "../client";
import { Typography, Button, Box, Modal, useMediaQuery } from "@mui/material";
import { Seed, SeedItem, SeedTeam } from "react-brackets";
import { styled } from "@mui/system";
import { Tweet } from "react-twitter-widgets";
import YoutubePlayer from "./YoutubePlayer";
import TikTokPlayer from "./TikTokPlayer";
import CustomLink from "../utils/CustomLink";

export default function CustomSeed(props) {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const [modal, setModal] = useState(false);
  const { seed, contest, matches, setMatches } = props;

  const isLastRound = matches[matches.length - 1].id === seed.match.id;

  const handleOpen = () => {
    setModal(true);
  };

  const handleClose = () => {
    setModal(false);
  };

  const chooseWinnerClick = async (matchData, winner) => {
    if (props.public) return;
    const confirmDialog = window.confirm(`${winner.display_name} will be the winner of this match. Are you sure?`);
    if (!confirmDialog) return;

    const newMatches = [...matches];

    await client
      .service("matches")
      .patch(matchData.id, {
        winner_id: winner.id,
      })
      .then((data) => {
        for (let i = 0; i < newMatches.length; i++) {
          if (parseInt(newMatches[i].id) !== parseInt(data.id)) continue;
          newMatches[i] = data;
          break;
        }
      })
      .catch((e) => {
        console.error(e);
      });

    const nextMatch =
      newMatches[newMatches.findIndex((match) => parseInt(match.previous_a_match) === matchData.challonge_match_id || parseInt(match.previous_b_match) === matchData.challonge_match_id)];

    if (!nextMatch) {
      setMatches(newMatches);
      return handleClose();
    }

    const isTeamA = nextMatch.previous_a_match === matchData.challonge_match_id;

    await client
      .service("matches")
      .patch(
        nextMatch.id,
        isTeamA
          ? {
              team_a_id: winner.userId,
            }
          : {
              team_b_id: winner.userId,
            }
      )
      .then((data) => {
        for (let x = 0; x < newMatches.length; x++) {
          if (parseInt(newMatches[x].id) !== parseInt(data.id)) continue;
          newMatches[x] = data;
          break;
        }
      })
      .catch((e) => {
        console.error(e);
      });

    setMatches(newMatches);

    handleClose();
  };

  const TEAM_A = seed.teams[0];
  const TEAM_B = seed.teams[1];

  return (
    <>
      {seed.useOldVersion ? (
        <Seed mobileBreakpoint={0} style={{ fontSize: "10px", minWidth: "100px" }}>
          <SeedItem>
            <div onClick={handleOpen}>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(TEAM_A.id) ? { color: "red" } : {}) : {}}>{TEAM_A?.name || "---------- "}</SeedTeam>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(TEAM_B.id) ? { color: "red" } : {}) : {}}>{TEAM_B?.name || "---------- "}</SeedTeam>
            </div>
          </SeedItem>
        </Seed>
      ) : seed.pairedMatch ? (
        <StyledSeed isTeamA={seed.isTeamA}>
          <SeedItem>
            <div onClick={handleOpen}>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(TEAM_A.id) ? { color: "red" } : {}) : {}}>{TEAM_A?.name || "---------- "}</SeedTeam>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(TEAM_B.id) ? { color: "red" } : {}) : {}}>{TEAM_B?.name || "---------- "}</SeedTeam>
            </div>
          </SeedItem>
        </StyledSeed>
      ) : (
        <SingleSeed isLastRound={isLastRound}>
          <SeedItem>
            <div onClick={handleOpen}>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(TEAM_A.id) ? { color: "red" } : {}) : {}}>{TEAM_A?.name || "---------- "}</SeedTeam>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(TEAM_B.id) ? { color: "red" } : {}) : {}}>{TEAM_B?.name || "---------- "}</SeedTeam>
            </div>
          </SeedItem>
        </SingleSeed>
      )}
      {(TEAM_A.submission || TEAM_B.submission) && contest && (
        <Modal open={modal} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", height: "100%", width: "100%", flexDirection: isMobile ? "column" : "row" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100%", height: "100%" }}>
                <Typography variant="body2" color="textSecondary">{`Submission ID: ${TEAM_A.submission ? TEAM_A.submission.id : "TBD"}`}</Typography>
                {TEAM_A.submission && (
                  <>
                    {contest.type === "alert" && (TEAM_A.submission.video?.source === "youtube" || !TEAM_A.submission.video.source) && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                        <YoutubePlayer show={true} submission={TEAM_A.submission} />
                      </Box>
                    )}

                    {contest.type === "alert" && TEAM_A.submission.video?.source === "tiktok" && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "22%" }}>
                        <TikTokPlayer submission={TEAM_A.submission} show={true} />
                      </Box>
                    )}

                    {contest.type === "clips" && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                        <iframe
                          title={TEAM_A.submission.video.id}
                          src={`https://clips.twitch.tv/embed?clip=${TEAM_A.submission.video.id}&parent=${window.location.hostname}`}
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
                          <Tweet tweetId={TEAM_A.submission.video.id} options={{ align: "center" }} />
                        </Box>
                      </Box>
                    )}

                    {contest.type === "song" && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                          <iframe
                            title="SoundCloud Player"
                            width="100%"
                            height="160"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${TEAM_A.submission.video.link.replace(
                              /(www\.|m\.)/,
                              ""
                            )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                          />
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ m: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                      <Typography variant="h6">{`${TEAM_A.submission ? TEAM_A.submission.title : ""}`}</Typography>
                      <Typography variant="h6" color="primary">{`${TEAM_A.submission ? TEAM_A.submission.display_name : ""}`}</Typography>
                      <CustomLink href={TEAM_A.submission ? TEAM_A.submission.video.link : ""} target="_blank" rel="noreferrer noopener" color="textSecondary">
                        <Typography variant="caption" noWrap>{`${TEAM_A.submission ? TEAM_A.submission.video.link : ""}`}</Typography>
                      </CustomLink>
                      {!props.public && TEAM_A.submission && (
                        <Button
                          sx={{ m: 1 }}
                          variant="outlined"
                          disabled={!TEAM_A.submission}
                          onClick={() => {
                            chooseWinnerClick(seed.match, TEAM_A.submission);
                          }}
                        >
                          Winner
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", m: 1 }}>
                <Typography variant="h4" color="error" sx={{ textTransform: "uppercase" }}>{`Vs`}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100%" }}>
                <Typography variant="body2" color="textSecondary">{`Submission ID: ${TEAM_B.submission ? TEAM_B.submission.id : "TBD"}`}</Typography>
                {TEAM_B.submission && (
                  <>
                    {contest.type === "alert" && (TEAM_B.submission.video?.source === "youtube" || !TEAM_B.submission.video.source) && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                        <YoutubePlayer show={true} submission={TEAM_B.submission} />
                      </Box>
                    )}

                    {contest.type === "alert" && TEAM_B.submission.video?.source === "tiktok" && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "22%" }}>
                        <TikTokPlayer submission={TEAM_B.submission} show={true} />
                      </Box>
                    )}

                    {contest.type === "clips" && (
                      <Box sx={{ m: 1, height: "100%", width: isMobile ? "100%" : "60%" }}>
                        <iframe
                          title={TEAM_B.submission.video.id}
                          src={`https://clips.twitch.tv/embed?clip=${TEAM_B.submission.video.id}&parent=${window.location.hostname}`}
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
                          <Tweet tweetId={TEAM_B.submission.video.id} options={{ align: "center" }} />
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
                            src={`https://w.soundcloud.com/player/?url=${TEAM_B.submission.video.link.replace(
                              /(www\.|m\.)/,
                              ""
                            )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                          />
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ m: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                      <Typography variant="h6">{`${TEAM_B.submission ? TEAM_B.submission.title : ""}`}</Typography>
                      <Typography variant="h6" color="primary">{`${TEAM_B.submission ? TEAM_B.submission.display_name : ""}`}</Typography>
                      <CustomLink href={TEAM_B.submission ? TEAM_B.submission.video.link : ""} target="_blank" rel="noreferrer noopener" color="textSecondary">
                        <Typography variant="caption" noWrap>{`${TEAM_B.submission ? TEAM_B.submission.video.link : ""}`}</Typography>
                      </CustomLink>
                      {!props.public && TEAM_B.submission && (
                        <Button
                          sx={{ m: 1 }}
                          variant="outlined"
                          disabled={!TEAM_B.submission}
                          onClick={() => {
                            chooseWinnerClick(seed.match, TEAM_B.submission);
                          }}
                        >
                          Winner
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
}

const StyledSeed = styled(({ isTeamA, ...props }) => <div {...props} />)`
  font-size: 10px;
  min-width: 100px;
  padding: 1em 1.5em;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 1 auto;
  flex-direction: column;
  justify-content: center;
  &::after {
    content: "";
    position: absolute;
    height: 50%;
    width: 1.5em;
    [dir="rtl"] & {
      left: 0px;
    }
    [dir="ltr"] & {
      right: 0px;
    }
  }
  ${(props) =>
    !props.isTeamA &&
    `&::before {
      content: "";
      border-top: 1px solid #707070;
      position: absolute;
      top: -0.5px;
      width: 1.5em;
      [dir="rtl"] & {
        left: -1.5em;
      }
      [dir="ltr"] & {
        right: -1.5em;
      }
    }`}
  ${(props) =>
    !props.isTeamA
      ? `&::after {
      border-bottom: 1px solid #707070;
      top: -0.5px;
      [dir="rtl"] & {
        border-left: 1px solid #707070;
      }
      [dir="ltr"] & {
        border-right: 1px solid #707070;
      }
    }`
      : `&::after {
      border-top: 1px solid #707070;
      top: calc(50% - 0.5px);
      [dir="rtl"] & {
        border-left: 1px solid #707070;
      }
      [dir="ltr"] & {
        border-right: 1px solid #707070;
      }
    }`}
`;

const SingleSeed = styled(({ isLastRound, ...props }) => <div {...props} />)`
  font-size: 10px;
  min-width: 100px;
  padding: 1em 1.5em;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 1 auto;
  flex-direction: column;
  justify-content: center;
  ${(props) =>
    !props.isLastRound &&
    `::after {
    content: "";
    position: absolute;
    height: 50%;
    width: 3em;
    [dir="rtl"] & {
      left: -1.5em;
    }
    [dir="ltr"] & {
      right: -1.5em;
    }
    border-bottom: 1px solid #707070;
  }`}
`;
