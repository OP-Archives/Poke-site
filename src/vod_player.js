import React, { useRef, useEffect } from "react";
import {
  makeStyles,
  Box,
  Container,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import Loader from "react-loader-spinner";
import Youtube from "react-youtube";
import SimpleBar from "simplebar-react";
import canAutoPlay from "can-autoplay";

const BADGES_TWITCH_URL =
  "https://badges.twitch.tv/v1/badges/global/display?language=en";
const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net/";
const BASE_TWITCH_EMOTES_API = "https://api.twitchemotes.com/api/v4/";
const BASE_FFZ_EMOTE_API = "https://api.frankerfacez.com/v1/";
const BASE_BTTV_EMOTE_API = "https://api.betterttv.net/3/";
const BASE_BTTV_CDN = "https://cdn.betterttv.net/";
const twitchId = "12943173";
let badgesCount = 0,
  channelBadges,
  badgeSets,
  FFZEmotes,
  BTTVGlobalEmotes,
  BTTVEmotes,
  messageCount = 0,
  player_offset = 0,
  comments = [],
  stoppedAtIndex = 0,
  cursor;

export default function VodPlayer(props) {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const [loading, setLoading] = React.useState(true);
  const [vodData, setVodData] = React.useState(null);
  const [player, setPlayer] = React.useState(null);
  const [chatInterval, setChatInterval] = React.useState(null);
  const [chatLoading, setChatLoading] = React.useState(null);
  const [replayMessages, setReplayMessages] = React.useState([]);
  const [youtubeIndex, setYoutubeIndex] = React.useState(0);
  const chatRef = useRef();
  const channel = props.channel;

  useEffect(() => {
    document.title = `${props.match.params.vodId} Vod - Poke`;
    const fetchVodData = async () => {
      fetch(`https://archive.overpowered.tv/${channel}/vods/${props.match.params.vodId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setVodData(data);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadBTTVGlobalEmotes = () => {
      fetch(`${BASE_BTTV_EMOTE_API}cached/emotes/global`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          BTTVGlobalEmotes = data;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadBTTVChannelEmotes = () => {
      fetch(`${BASE_BTTV_EMOTE_API}cached/users/twitch/${twitchId}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          BTTVEmotes = data.sharedEmotes.concat(data.channelEmotes);
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadFFZEmotes = () => {
      fetch(`${BASE_FFZ_EMOTE_API}room/id/${twitchId}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          FFZEmotes = data.sets[data.room.set].emoticons;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadBadges = () => {
      fetch(BADGES_TWITCH_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          badgeSets = data.badge_sets;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const loadChannelBadges = () => {
      fetch(`${BASE_TWITCH_EMOTES_API}channels/${twitchId}`)
        .then((response) => response.json())
        .then((data) => {
          channelBadges = {
            subscriber: data.subscriber_badges,
            bits: data.bits_badges,
          };
        })
        .catch((e) => {
          console.error(e);
        });
    };

    fetchVodData();
    loadBadges();
    loadChannelBadges();
    loadFFZEmotes();
    loadBTTVGlobalEmotes();
    loadBTTVChannelEmotes();
    return;
  }, [props.match]);

  const onReady = (evt) => {
    setPlayer(evt.target);
    canAutoPlay.video().then(({ result }) => {
      if (!result) {
        evt.target.mute();
      }
    });
  };

  const onPlay = async (evt) => {
    setChatLoading(true);
    comments = [];
    setReplayMessages([]);
    stoppedAtIndex = 0;

    player_offset = player.getCurrentTime() + (youtubeIndex * 43199);
    cursor = null;
    fetchComments(player_offset);
  };

  useEffect(() => {
    if (!player) return;
    const fetchNextComments = async () => {
      await fetch(
        `https://archive.overpowered.tv/${channel}/v1/vods/${props.match.params.vodId}/comments?cursor=${cursor}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          comments = comments.concat(data.comments);
          cursor = data.cursor;
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const badges = (badges) => {
      if (!badges) return null;
      let badgeWrapper = [];
      for (const badge of badges) {
        if (channelBadges) {
          const channelBadge = channelBadges[badge._id];
          if (channelBadge) {
            if (channelBadge[badge.version]) {
              badgeWrapper.push(
                <img
                  key={badgesCount++}
                  crossOrigin="anonymous"
                  className={classes.badges}
                  src={channelBadge[badge.version].image_url_1x}
                  srcSet={`${channelBadge[badge.version].image_url_1x} 1x, ${
                    channelBadge[badge.version].image_url_2x
                  } 2x, ${channelBadge[badge.version].image_url_4x} 4x`}
                  alt=""
                />
              );
            }
            continue;
          }
        }

        const twitchBadge = badgeSets[badge._id];
        if (twitchBadge) {
          badgeWrapper.push(
            <img
              key={badgesCount++}
              crossOrigin="anonymous"
              className={classes.badges}
              src={`${BASE_TWITCH_CDN}badges/v1/${
                twitchBadge.versions[badge.version].image_url_1x
              }`}
              srcSet={`${BASE_TWITCH_CDN}badges/v1/${
                twitchBadge.versions[badge.version].image_url_1x
              } 1x, ${BASE_TWITCH_CDN}badges/v1/${
                twitchBadge.versions[badge.version].image_url_2x
              } 2x, ${BASE_TWITCH_CDN}badges/v1/${
                twitchBadge.versions[badge.version].image_url_4x
              } 4x`}
              alt=""
            />
          );
        }
      }

      return <span className="chat-line__message--badges">{badgeWrapper}</span>;
    };

    const transformMessage = (messageFragments) => {
      const textFragments = [];
      for (let messageFragment of messageFragments) {
        if (!messageFragment.emoticon) {
          let messageArray = messageFragment.text.split(" ");
          for (let message of messageArray) {
            let found;
            if (FFZEmotes) {
              for (let ffz_emote of FFZEmotes) {
                if (message === ffz_emote.name) {
                  found = true;
                  textFragments.push(
                    <div key={messageCount++} style={{ display: "inline" }}>
                      <img
                        crossOrigin="anonymous"
                        className={classes.chatEmote}
                        src={ffz_emote.urls["1"]}
                        srcSet={`${ffz_emote.urls["1"]} 1x, ${ffz_emote.urls["2"]} 2x, ${ffz_emote.urls["4"]} 4x`}
                        alt=""
                      />
                      {` `}
                    </div>
                  );
                  break;
                }
              }
              if (found) continue;
            }

            if (BTTVGlobalEmotes) {
              for (let bttv_emote of BTTVGlobalEmotes) {
                if (message === bttv_emote.code) {
                  found = true;
                  textFragments.push(
                    <div key={messageCount++} style={{ display: "inline" }}>
                      <img
                        className={classes.chatEmote}
                        src={`${BASE_BTTV_CDN}emote/${bttv_emote.id}/1x`}
                        srcSet={`${BASE_BTTV_CDN}emote/${bttv_emote.id}/1x 1x, ${BASE_BTTV_CDN}emote/${bttv_emote.id}/2x 2x, ${BASE_BTTV_CDN}emote/${bttv_emote.id}/3x 4x`}
                        alt=""
                      />
                      {` `}
                    </div>
                  );
                  break;
                }
              }
              if (found) continue;
            }

            if (BTTVEmotes) {
              for (let bttv_emote of BTTVEmotes) {
                if (message === bttv_emote.code) {
                  found = true;
                  textFragments.push(
                    <div key={messageCount++} style={{ display: "inline" }}>
                      <img
                        className={classes.chatEmote}
                        src={`${BASE_BTTV_CDN}emote/${bttv_emote.id}/1x`}
                        srcSet={`${BASE_BTTV_CDN}emote/${bttv_emote.id}/1x 1x, ${BASE_BTTV_CDN}emote/${bttv_emote.id}/2x 2x, ${BASE_BTTV_CDN}emote/${bttv_emote.id}/3x 4x`}
                        alt=""
                      />
                      {` `}
                    </div>
                  );
                  break;
                }
              }
              if (found) continue;
            }

            //rest is just text
            textFragments.push(
              <span key={messageCount++}>{`${message} `}</span>
            );
          }
        } else {
          textFragments.push(
            <div key={messageCount++} style={{ display: "inline" }}>
              <img
                crossOrigin="anonymous"
                className={classes.chatEmote}
                src={`${BASE_TWITCH_CDN}emoticons/v1/${messageFragment.emoticon.emoticon_id}/1.0`}
                srcSet={
                  messageFragment.emoticon.emoticon_set_id
                    ? `${BASE_TWITCH_CDN}emoticons/v1/${messageFragment.emoticon.emoticon_set_id}/1.0 1x, ${BASE_TWITCH_CDN}emoticons/v1/${messageFragment.emoticon.emoticon_set_id}/2.0 2x`
                    : ""
                }
                alt=""
              />
            </div>
          );
        }
      }
      return <span className="messages">{textFragments}</span>;
    };
    const buildChat = () => {
      if (comments.length === 0 || player.getPlayerState() === 2) return;
      const playerCurrentTime = player.getCurrentTime() + (youtubeIndex * 43199);

      let pastIndex = comments.length - 1;
      for (let i = stoppedAtIndex.valueOf(); i < comments.length; i++) {
        const comment = comments[i];
        if (comment.content_offset_seconds > playerCurrentTime) {
          pastIndex = i;
          break;
        }
      }

      if (stoppedAtIndex === pastIndex && stoppedAtIndex !== 0) return;

      let messages = replayMessages.slice(0);

      for (let i = stoppedAtIndex.valueOf(); i < pastIndex; i++) {
        if (messages.length > 30) {
          messages.splice(0, 1);
        }
        const comment = comments[i];
        messages.push(
          <li key={comment.id} style={{ width: "100%" }}>
            <Box
              alignItems="flex-start"
              display="flex"
              flexWrap="nowrap"
              width="100%"
              paddingLeft="0.5rem"
              paddingTop="0.5rem"
              paddingBottom="0.5rem"
            >
              <Box width="100%">
                <Box
                  alignItems="flex-start"
                  display="flex"
                  flexWrap="nowrap"
                  color="#fff"
                >
                  <Box flexGrow={1}>
                    {badges(comment.user_badges)}
                    <a
                      href={`https://twitch.tv/${comment.display_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#615b5b", textDecoration: "none" }}
                    >
                      <span
                        style={{ color: comment.user_color, fontWeight: "700" }}
                      >
                        {comment.display_name}
                      </span>
                    </a>
                    <Box display="inline">
                      <span>: </span>
                      {transformMessage(comment.message)}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </li>
        );
      }

      if (comments.length - 1 === pastIndex && cursor) {
        fetchNextComments();
      }

      setReplayMessages(messages);
      stoppedAtIndex = pastIndex;
      setChatLoading(false);
    };

    buildChat();
    const intervalId = setInterval(buildChat, 100);
    setChatInterval(intervalId);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [player, replayMessages, classes, props.match]);

  const clearChatInterval = (evt) => {
    clearInterval(chatInterval);
  };

  const onEnd = (evt) => {
    clearInterval(chatInterval)
    if(youtubeIndex !== vodData.youtube_id.length) {
      const newIndex = youtubeIndex + 1;
      setYoutubeIndex(newIndex)
      player.loadVideoById(vodData.youtube_id[newIndex]);
    }
  }

  const playerError = (evt) => {
    console.error(evt.data);
  };

  const fetchComments = async (offset) => {
    await fetch(
      `https://archive.overpowered.tv/poke/v1/vods/${props.match.params.vodId}/comments?content_offset_seconds=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        comments = data.comments;
        cursor = data.cursor;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    return;
  }, [replayMessages, chatRef]);

  return loading ? (
    <div style={{ padding: "30vh 0", textAlign: "center" }}>
      <Loader type="Oval" color="#00BFFF" height={150} width={150} />
      <h2 style={{ color: "#fff", marginTop: "2rem", fontSize: "2rem" }}>
        Loading...
      </h2>
    </div>
  ) : (
    <Container maxWidth={false} disableGutters style={{ height: "100%" }}>
      <Box display={isMobile ? "block" : "flex"} className={classes.player}>
        <Youtube
          videoId={vodData.youtube_id[0]}
          containerClassName={
            !isMobile ? classes.horizPlayer : classes.vertPlayer
          }
          id="player"
          opts={{
            height: "100%",
            width: "100%",
            playerVars: {
              autoplay: 1,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
            },
          }}
          onReady={onReady}
          onPlay={onPlay}
          onPause={clearChatInterval}
          onEnd={onEnd}
          onError={playerError}
        />
        <div className={!isMobile ? classes.horizChat : classes.vertChat}>
          {chatLoading ? (
            <div
              style={{
                textAlign: "center",
                marginTop: isMobile ? "3rem" : "20vh",
              }}
            >
              <Loader type="Oval" color="#00BFFF" height={125} width={125} />
              <Typography variant="h5" className={classes.text}>
                Loading Chat...
              </Typography>
            </div>
          ) : (
            <div className={classes.chat}>
              <SimpleBar
                scrollableNodeProps={{ ref: chatRef }}
                className={classes.scroll}
              >
                <Box
                  display="flex"
                  height="100%"
                  justifyContent="flex-end"
                  flexDirection="column"
                >
                  <ul className={classes.ul}>{replayMessages}</ul>
                </Box>
              </SimpleBar>
            </div>
          )}
        </div>
      </Box>
    </Container>
  );
}

const useStyles = makeStyles(() => ({
  player: {
    height: "100%",
    width: "100%",
  },
  horizPlayer: {
    width: "calc(100% - 340px)",
    height: "100%",
  },
  horizChat: {
    backgroundColor: "#0e0e10",
    width: "340px",
    height: "100%",
  },
  vertPlayer: {
    height: "calc(100% - 500px)",
    width: "100%",
  },
  vertChat: {
    backgroundColor: "#0e0e10",
    height: "500px",
    width: "100%",
  },
  text: {
    marginTop: "1rem",
    color: "#fff",
  },
  chat: {
    height: "100%",
    width: "100%",
    backgroundColor: "#0e0e10",
    fontSize: "1rem",
    fontFamily: "helvetica neue,Helvetica,Arial,sans-serif",
    flex: "1 1 auto",
    lineHeight: "1rem",
    marginRight: ".2rem",
    overflowX: "hidden",
    overflowY: "auto",
  },
  scroll: {
    height: "100%",
  },
  ul: {
    minHeight: "0px",
    width: "calc(100% - 10px)",
    display: "flex",
    alignItems: "flex-end",
    flexWrap: "wrap",
    listStyle: "none",
  },
  badges: {
    display: "inline-block",
    minWidth: "1rem",
    height: "1rem",
    margin: "0 .2rem .1rem 0",
    backgroundPosition: "50%",
    verticalAlign: "middle",
  },
  chatEmote: {
    verticalAlign: "middle",
    border: "none",
    maxWidth: "100%",
  },
}));
