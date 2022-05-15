import Youtube from "react-youtube";
import SimpleBar from "simplebar-react";
import React, { useState } from "react";
import client from "../client";
import { Typography, Button, Box, Modal, Link } from "@mui/material";
import { Seed, SeedItem, SeedTeam } from "react-brackets";
import { styled } from "@mui/system";
import { Tweet } from "react-twitter-widgets";

export default function CustomSeed(props) {
  const [modal, setModal] = useState(false);
  const { seed, contest, classes, matches } = props;

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
      props.setMatches(newMatches);
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

    props.setMatches(newMatches);

    handleClose();
  };

  console.log(seed);

  return (
    <>
      {seed.useOldVersion ? (
        <Seed mobileBreakpoint={0} onClick={handleOpen} style={{ fontSize: "10px", minWidth: "100px" }}>
          <SeedItem>
            <div>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(seed.teams[0].id) ? { color: "red" } : {}) : {}}>{seed.teams[0]?.name || "---------- "}</SeedTeam>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(seed.teams[1].id) ? { color: "red" } : {}) : {}}>{seed.teams[1]?.name || "---------- "}</SeedTeam>
            </div>
          </SeedItem>
        </Seed>
      ) : seed.pairedMatch ? (
        <StyledSeed isTeamA={seed.isTeamA} onClick={handleOpen}>
          <SeedItem>
            <div>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(seed.teams[0].id) ? { color: "red" } : {}) : {}}>{seed.teams[0]?.name || "---------- "}</SeedTeam>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(seed.teams[1].id) ? { color: "red" } : {}) : {}}>{seed.teams[1]?.name || "---------- "}</SeedTeam>
            </div>
          </SeedItem>
        </StyledSeed>
      ) : (
        <SingleSeed isLastRound={isLastRound} onClick={handleOpen}>
          <SeedItem>
            <div>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(seed.teams[0].id) ? { color: "red" } : {}) : {}}>{seed.teams[0]?.name || "---------- "}</SeedTeam>
              <SeedTeam style={seed.winner ? (seed.winner === parseInt(seed.teams[1].id) ? { color: "red" } : {}) : {}}>{seed.teams[1]?.name || "---------- "}</SeedTeam>
            </div>
          </SeedItem>
        </SingleSeed>
      )}
      {(seed.teams[0].submission || seed.teams[1].submission) && (
        <Modal open={modal} onClose={handleClose}>
          <div className={`${classes.modalContent} ${classes.modal}`}>
            <SimpleBar className={classes.modalParent}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                  <div>
                    <Typography
                      variant="body2"
                      className={parseInt(seed.match.winner_id) === seed.teams[0].submission ? (parseInt(seed.teams[0].submission.id) ? classes.winner : classes.text) : classes.text}
                    >{`Submission ID: ${seed.teams[0].submission ? seed.teams[0].submission.id : null}`}</Typography>
                  </div>
                  <Box marginTop="1rem">
                    {contest && contest.type === "song" && (
                      <Box display="flex" flexDirection="column" width="100%">
                        <iframe
                          title="Player"
                          width="426"
                          height="160"
                          scrolling="no"
                          frameBorder="no"
                          allow="autoplay"
                          src={`https://w.soundcloud.com/player/?url=${
                            seed.teams[0].submission ? seed.teams[0].submission.video.link : "".replace(/(www\.|m\.)/, "")
                          }&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                        />
                      </Box>
                    )}

                    {contest && contest.type === "alert" && seed.teams[0].submission && (seed.teams[0].submission.video.source === "youtube" || !seed.teams[0].submission.video.source) && (
                      <Youtube
                        videoId={seed.teams[0].submission ? seed.teams[0].submission.video.id : null}
                        id="player"
                        opts={{
                          height: "240px",
                          width: "426px",
                          playerVars: {
                            autoplay: 0,
                            playsinline: 1,
                            rel: 0,
                            modestbranding: 1,
                          },
                        }}
                      />
                    )}

                    {contest && contest.type === "alert" && seed.teams[0].submission && seed.teams[0].submission.video.source === "tiktok" && (
                      <div
                        className="tiktok-container"
                        style={{
                          height: "500px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <iframe
                          className="tiktok-iframe"
                          title="Player"
                          width="300px"
                          height="500px"
                          scrolling="no"
                          frameBorder="no"
                          allowFullScreen
                          src={`https://tiktok.com/embed/${seed.teams[0].submission.video.id}`}
                        />
                      </div>
                    )}

                    {contest && contest.type === "review" && (
                      <Box display="flex" flexDirection="column" width="100%">
                        <Tweet tweetId={seed.teams[0].submission ? seed.teams[0].submission.video.id : null} options={{ align: "center" }} />
                      </Box>
                    )}

                    {contest && contest.type === "clips" && (
                      <iframe
                        title={seed.teams[0].submission ? seed.teams[0].submission.video.id : null}
                        src={`https://clips.twitch.tv/embed?clip=${seed.teams[0].submission ? seed.teams[0].submission.video.id : null}&parent=${window.location.hostname}`}
                        height="240px"
                        width="426px"
                        allowFullScreen={true}
                        preload="auto"
                        frameBorder="0"
                      />
                    )}
                  </Box>
                  <Box marginTop="1rem" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <Typography
                      variant="body2"
                      className={parseInt(seed.match.winner_id) === seed.teams[0].submission ? (parseInt(seed.teams[0].submission.id) ? classes.winner : classes.text) : classes.text}
                    >{`${seed.teams[0].submission ? seed.teams[0].submission.title : null}`}</Typography>
                    <Typography
                      variant="body2"
                      className={parseInt(seed.match.winner_id) === seed.teams[0].submission ? (parseInt(seed.teams[0].submission.id) ? classes.winner : classes.text) : classes.text}
                    >{`${seed.teams[0].submission ? seed.teams[0].submission.display_name : null}`}</Typography>
                    <Link
                      underline="hover"
                      href={seed.teams[0].submission ? seed.teams[0].submission.video.link : null}
                      target="_blank"
                      rel="noreferrer noopener"
                      variant="caption"
                      color="textSecondary"
                    >
                      <Typography
                        variant="caption"
                        className={parseInt(seed.match.winner_id) === seed.teams[0].submission ? (parseInt(seed.teams[0].submission.id) ? classes.winner : classes.text) : classes.text}
                      >
                        {`${seed.teams[0].submission ? seed.teams[0].submission.video.link : null}`}
                      </Typography>
                    </Link>
                    <div style={{ marginTop: "0.5rem" }}>
                      <Typography
                        variant="caption"
                        style={{ wordBreak: "break-word" }}
                        className={parseInt(seed.match.winner_id) === seed.teams[0].submission ? (parseInt(seed.teams[0].submission.id) ? classes.winner : classes.text) : classes.text}
                      >
                        {`${seed.teams[0].submission ? (seed.teams[0].submission.comment.length === 0 ? "..." : seed.teams[0].submission.comment) : null}`}
                      </Typography>
                    </div>
                    {!props.public && seed.teams[0].submission && (
                      <div style={{ marginTop: "1rem" }}>
                        <Button
                          variant="outlined"
                          disabled={!seed.teams[0].submission}
                          onClick={() => {
                            chooseWinnerClick(seed.match, seed.teams[0].submission);
                          }}
                          className={classes.button}
                        >
                          Winner
                        </Button>
                      </div>
                    )}
                  </Box>
                </Box>
                <Box padding="5rem" display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h4" className={classes.text}>
                    {`Vs`}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                    <div>
                      <Typography
                        variant="body2"
                        className={parseInt(seed.match.winner_id) === seed.teams[1].submission ? (parseInt(seed.teams[1].submission.id) ? classes.winner : classes.text) : classes.text}
                      >{`Submission ID: ${seed.teams[1].submission ? seed.teams[1].submission.id : null}`}</Typography>
                    </div>
                    <Box marginTop="1rem">
                      {contest && contest.type === "song" && (
                        <Box display="flex" flexDirection="column" width="100%">
                          <iframe
                            title="Player"
                            width="426"
                            height="160"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${
                              seed.teams[1].submission ? seed.teams[1].submission.video.link : "".replace(/(www\.|m\.)/, "")
                            }&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                          />
                        </Box>
                      )}

                      {contest && contest.type === "alert" && seed.teams[1].submission && (seed.teams[1].submission.video.source === "youtube" || !seed.teams[1].submission.video.source) && (
                        <Youtube
                          videoId={seed.teams[1].submission ? seed.teams[1].submission.video.id : null}
                          id="player"
                          opts={{
                            height: "240px",
                            width: "426px",
                            playerVars: {
                              autoplay: 0,
                              playsinline: 1,
                              rel: 0,
                              modestbranding: 1,
                            },
                          }}
                        />
                      )}

                      {contest && contest.type === "alert" && seed.teams[1].submission && seed.teams[1].submission.video.source === "tiktok" && (
                        <div
                          className="tiktok-container"
                          style={{
                            height: "500px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <iframe
                            className="tiktok-iframe"
                            title="Player"
                            width="300px"
                            height="500px"
                            scrolling="no"
                            frameBorder="no"
                            allowFullScreen
                            src={`https://tiktok.com/embed/${seed.teams[1].submission.video.id}`}
                          />
                        </div>
                      )}

                      {contest && contest.type === "review" && (
                        <Box display="flex" flexDirection="column" width="100%">
                          <Tweet tweetId={seed.teams[1].submission ? seed.teams[1].submission.video.id : null} options={{ align: "center" }} />
                        </Box>
                      )}

                      {contest && contest.type === "clips" && (
                        <iframe
                          title={seed.teams[1].submission ? seed.teams[1].submission.video.id : null}
                          src={`https://clips.twitch.tv/embed?clip=${seed.teams[1].submission ? seed.teams[1].submission.video.id : null}&parent=${window.location.hostname}`}
                          height="240px"
                          width="426px"
                          allowFullScreen={true}
                          preload="auto"
                          frameBorder="0"
                        />
                      )}
                    </Box>
                    <Box marginTop="1rem" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      <Typography
                        variant="body2"
                        className={parseInt(seed.match.winner_id) === seed.teams[1].submission ? (parseInt(seed.teams[1].submission.id) ? classes.winner : classes.text) : classes.text}
                      >{`${seed.teams[1].submission ? seed.teams[1].submission.title : null}`}</Typography>
                      <Typography
                        variant="body2"
                        className={parseInt(seed.match.winner_id) === seed.teams[1].submission ? (parseInt(seed.teams[1].submission.id) ? classes.winner : classes.text) : classes.text}
                      >{`${seed.teams[1].submission ? seed.teams[1].submission.display_name : null}`}</Typography>
                      <Link
                        underline="hover"
                        href={seed.teams[1].submission ? seed.teams[1].submission.video.link : null}
                        target="_blank"
                        rel="noreferrer noopener"
                        variant="caption"
                        color="textSecondary"
                      >
                        <Typography
                          variant="caption"
                          className={parseInt(seed.match.winner_id) === seed.teams[1].submission ? (parseInt(seed.teams[1].submission.id) ? classes.winner : classes.text) : classes.text}
                        >
                          {`${seed.teams[1].submission ? seed.teams[1].submission.video.link : null}`}
                        </Typography>
                      </Link>

                      <div style={{ marginTop: "0.5rem" }}>
                        <Typography
                          variant="caption"
                          style={{ wordBreak: "break-word" }}
                          className={parseInt(seed.match.winner_id) === seed.teams[1].submission ? (parseInt(seed.teams[1].submission.id) ? classes.winner : classes.text) : classes.text}
                        >
                          {`${seed.teams[1].submission ? (seed.teams[1].submission.comment.length === 0 ? "..." : seed.teams[1].submission.comment) : null}`}
                        </Typography>
                      </div>
                      {!props.public && (
                        <div style={{ marginTop: "1rem" }}>
                          <Button
                            variant="outlined"
                            disabled={!seed.teams[1].submission}
                            onClick={() => {
                              chooseWinnerClick(seed.match, seed.teams[1].submission);
                            }}
                            className={classes.button}
                          >
                            Winner
                          </Button>
                        </div>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </SimpleBar>
          </div>
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
