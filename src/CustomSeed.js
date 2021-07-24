import Youtube from "react-youtube";
import SimpleBar from "simplebar-react";
import React, { useState } from "react";
import client from "./client";
import { Typography, Button, Box, Modal } from "@material-ui/core";
import { Seed, SeedItem, SeedTeam } from "react-brackets";

export default function CustomSeed(props) {
  const [modal, setModal] = useState(false);
  console.log(props);

  const handleOpen = () => {
    setModal(true);
  };

  const handleClose = () => {
    setModal(false);
  };

  const chooseWinnerClick = async (matchData, winner) => {
    if (props.public) return;
    const confirmDialog = window.confirm(
      `${winner.display_name} will be the winner of this match. Are you sure?`
    );
    if (!confirmDialog) return;

    const newMatches = [...props.matches];

    await client
      .service("matches")
      .patch(matchData.id, {
        winner_id: winner.id,
      })
      .then((data) => {
        for (let i = 0; i < newMatches.length; i++) {
          let match = newMatches[i];
          if (parseInt(match.id) !== parseInt(data.id)) continue;
          newMatches[i] = data;
          break;
        }
      })
      .catch((e) => {
        console.error(e);
      });

    const nextRound = parseInt(matchData.round) + 1;
    const nextRoundMatches = newMatches.filter(
      (match) => parseInt(match.round) === nextRound
    );

    if (nextRoundMatches.length === 0) {
      props.setMatches(newMatches);
      handleClose();
    }

    const thisRoundMatches = newMatches.filter(
      (match) => parseInt(match.round) === parseInt(matchData.round)
    );

    let indexOfMatch = -1;
    for (let i = 0; i < thisRoundMatches.length; i++) {
      if (parseInt(thisRoundMatches[i].id) !== matchData.id) continue;
      indexOfMatch = i;
      break;
    }

    const nextMatch = nextRoundMatches[Math.floor(indexOfMatch / 2)];
    if (!nextMatch) return;

    await client
      .service("matches")
      .patch(
        nextMatch.id,
        indexOfMatch % 2
          ? {
              team_b_id: winner.id,
            }
          : !(indexOfMatch % 2) || indexOfMatch === 0
          ? {
              team_a_id: winner.id,
            }
          : {}
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

  console.log(props.seed.match.winner_id);
  console.log(
    props.seed.teams[0].submission ? props.seed.teams[0].submission.id : null
  );
  console.log(
    props.seed.teams[1].submission ? props.seed.teams[1].submission.id : null
  );

  return (
    <>
      <Seed
        onClick={handleOpen}
        mobileBreakpoint={props.breakpoint}
        style={{ fontSize: 10, minWidth: "100px" }}
      >
        <SeedItem>
          <div>
            <SeedTeam
              style={
                props.seed.winner
                  ? props.seed.winner === parseInt(props.seed.teams[0].id)
                    ? { color: "red" }
                    : {}
                  : {}
              }
            >
              {props.seed.teams[0]?.name || "---------- "}
            </SeedTeam>
            <SeedTeam
              style={
                props.seed.winner
                  ? props.seed.winner === parseInt(props.seed.teams[1].id)
                    ? { color: "red" }
                    : {}
                  : {}
              }
            >
              {props.seed.teams[1]?.name || "---------- "}
            </SeedTeam>
          </div>
        </SeedItem>
      </Seed>
      {props.seed.teams[0].submission && props.seed.teams[1].submission ? (
        <Modal open={modal} onClose={handleClose}>
          <div
            className={`${props.classes.modalContent} ${props.classes.modal}`}
          >
            <SimpleBar className={props.classes.modalParent}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  flexDirection="column"
                >
                  <div>
                    <Typography
                      variant="body2"
                      className={
                        parseInt(props.seed.match.winner_id) ===
                        parseInt(props.seed.teams[0].submission.id)
                          ? props.classes.winner
                          : props.classes.text
                      }
                    >{`Submission ID: ${props.seed.teams[0].submission.id}`}</Typography>
                  </div>
                  <Box marginTop="1rem">
                    {props.contest.type === "song" ? (
                      <Box display="flex" flexDirection="column" width="100%">
                        <iframe
                          title="Player"
                          width="426"
                          height="160"
                          scrolling="no"
                          frameBorder="no"
                          allow="autoplay"
                          src={`https://w.soundcloud.com/player/?url=${props.seed.teams[0].submission.video.link.replace(
                            /(www\.|m\.)/,
                            ""
                          )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                        />
                      </Box>
                    ) : props.contest.type === "alert" ? (
                      <Youtube
                        videoId={props.seed.teams[0].submission.video.id}
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
                    ) : (
                      <></>
                    )}
                  </Box>
                  <Box
                    marginTop="1rem"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                  >
                    <Typography
                      variant="body2"
                      className={
                        parseInt(props.seed.match.winner_id) ===
                        parseInt(props.seed.teams[0].submission.id)
                          ? props.classes.winner
                          : props.classes.text
                      }
                    >{`${props.seed.teams[0].submission.title}`}</Typography>
                    <Typography
                      variant="body2"
                      className={
                        parseInt(props.seed.match.winner_id) ===
                        parseInt(props.seed.teams[0].submission.id)
                          ? props.classes.winner
                          : props.classes.text
                      }
                    >{`${props.seed.teams[0].submission.display_name}`}</Typography>
                    <a
                      href={props.seed.teams[0].submission.video.link}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Typography variant="caption" className={parseInt(props.seed.match.winner_id) ===
                        parseInt(props.seed.teams[0].submission.id)
                          ? props.classes.winnerLink
                          : props.classes.textLink}>
                        {`${props.seed.teams[0].submission.video.link}`}
                      </Typography>
                    </a>
                    <div style={{ marginTop: "0.5rem" }}>
                      <Typography
                        variant="caption"
                        style={{ wordBreak: "break-word" }}
                        className={
                          parseInt(props.seed.match.winner_id) ===
                          parseInt(props.seed.teams[0].submission.id)
                            ? props.classes.winner
                            : props.classes.text
                        }
                      >
                        {`${props.seed.teams[0].submission.comment}`}
                      </Typography>
                    </div>
                    {!props.public ? (
                      <div style={{ marginTop: "1rem" }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            chooseWinnerClick(
                              props.seed.match,
                              props.seed.teams[0].submission
                            );
                          }}
                          className={props.classes.button}
                        >
                          Winner
                        </Button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </Box>
                </Box>
                <Box
                  padding="5rem"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="h4" className={props.classes.text}>
                    {`Vs`}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                    flexDirection="column"
                  >
                    <div>
                      <Typography
                        variant="body2"
                        className={
                          parseInt(props.seed.match.winner_id) ===
                          parseInt(props.seed.teams[1].submission.id)
                            ? props.classes.winner
                            : props.classes.text
                        }
                      >{`Submission ID: ${props.seed.teams[1].submission.id}`}</Typography>
                    </div>
                    <Box marginTop="1rem">
                      {props.contest.type === "song" ? (
                        <Box display="flex" flexDirection="column" width="100%">
                          <iframe
                            title="Player"
                            width="426"
                            height="160"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${props.seed.teams[1].submission.video.link.replace(
                              /(www\.|m\.)/,
                              ""
                            )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                          />
                        </Box>
                      ) : props.contest.type === "alert" ? (
                        <Youtube
                          videoId={props.seed.teams[1].submission.video.id}
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
                      ) : (
                        <></>
                      )}
                    </Box>
                    <Box
                      marginTop="1rem"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      flexDirection="column"
                    >
                      <Typography
                        variant="body2"
                        className={
                          parseInt(props.seed.match.winner_id) ===
                          parseInt(props.seed.teams[1].submission.id)
                            ? props.classes.winner
                            : props.classes.text
                        }
                      >{`${props.seed.teams[1].submission.title}`}</Typography>
                      <Typography
                        variant="body2"
                        className={
                          parseInt(props.seed.match.winner_id) ===
                          parseInt(props.seed.teams[1].submission.id)
                            ? props.classes.winner
                            : props.classes.text
                        }
                      >{`${props.seed.teams[1].submission.display_name}`}</Typography>
                      <a
                        href={props.seed.teams[1].submission.video.link}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <Typography
                          variant="caption"
                          className={
                            parseInt(props.seed.match.winner_id) ===
                            parseInt(props.seed.teams[1].submission.id)
                              ? props.classes.winnerLink
                              : props.classes.textLink
                          }
                        >
                          {`${props.seed.teams[1].submission.video.link}`}
                        </Typography>
                      </a>
                      <div style={{ marginTop: "0.5rem" }}>
                        <Typography
                          variant="caption"
                          style={{ wordBreak: "break-word" }}
                          className={
                            parseInt(props.seed.match.winner_id) ===
                            parseInt(props.seed.teams[1].submission.id)
                              ? props.classes.winner
                              : props.classes.text
                          }
                        >
                          {`${props.seed.teams[1].submission.comment}`}
                        </Typography>
                      </div>
                      {!props.public ? (
                        <div style={{ marginTop: "1rem" }}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              chooseWinnerClick(
                                props.seed.match,
                                props.seed.teams[1].submission
                              );
                            }}
                            className={props.classes.button}
                          >
                            Winner
                          </Button>
                        </div>
                      ) : (
                        <></>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </SimpleBar>
          </div>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
}
