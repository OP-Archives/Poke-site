import React, { Component } from "react";
import {
  withStyles,
  Box,
  Container,
  useMediaQuery,
  CircularProgress,
} from "@material-ui/core";
import Youtube from "react-youtube";
import SimpleBar from "simplebar-react";
import canAutoPlay from "can-autoplay";
import Logo from "./assets/jammin.gif";

class VodPlayer extends Component {
  constructor(props) {
    super(props);

    this.BADGES_TWITCH_URL =
      "https://badges.twitch.tv/v1/badges/global/display?language=en";
    this.BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net/";
    this.BASE_TWITCH_EMOTES_API = "https://api.twitchemotes.com/api/v4/";
    this.BASE_FFZ_EMOTE_API = "https://api.frankerfacez.com/v1/";
    this.BASE_BTTV_EMOTE_API = "https://api.betterttv.net/3/";
    this.BASE_BTTV_CDN = "https://cdn.betterttv.net/";
    this.vodId = props.match.params.vodId;
    this.twitchId = props.twitchId;
    this.player = null;
    this.chatRef = React.createRef();
    this.messageCount = 0;
    this.badgesCount = 0;
    this.channel = props.channel;
    this.durations = [];
    let part = new URLSearchParams(props.location.search).get("part");
    if (part && !isNaN(part) && part > 0) {
      part = part - 1;
    } else {
      part = 0;
    }
    this.state = {
      part: part,
      chatLoading: true,
      messages: [],
      stoppedAtIndex: 0,
    };
  }

  componentDidMount() {
    document.title = `${this.props.match.params.vodId} Vod - Poke`;
    this.fetchVodData();
    this.loadBadges();
    this.loadChannelBadges(this.twitchId);
    this.loadFFZEmotes(this.twitchId);
    this.loadBTTVGlobalEmotes(this.twitchId);
    this.loadBTTVChannelEmotes(this.twitchId);
  }

  componentWillUnmount() {
    this.clearLoopTimeout();
  }

  fetchVodData = async () => {
    fetch(`https://archive.overpowered.tv/${this.channel}/vods/${this.vodId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ vodData: data });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadBTTVGlobalEmotes = () => {
    fetch(`${this.BASE_BTTV_EMOTE_API}cached/emotes/global`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        this.BTTVGlobalEmotes = data;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadBTTVChannelEmotes = (twitchId) => {
    fetch(`${this.BASE_BTTV_EMOTE_API}cached/users/twitch/${twitchId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        this.BTTVEmotes = data.sharedEmotes.concat(data.channelEmotes);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadFFZEmotes = (twitchId) => {
    fetch(`${this.BASE_FFZ_EMOTE_API}room/id/${twitchId}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        this.FFZEmotes = data.sets[data.room.set].emoticons;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadBadges = () => {
    fetch(this.BADGES_TWITCH_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.badgeSets = data.badge_sets;
      })
      .catch((e) => {
        console.error(e);
      });
  };

  loadChannelBadges = (twitchId) => {
    fetch(`${this.BASE_TWITCH_EMOTES_API}channels/${twitchId}`)
      .then((response) => response.json())
      .then((data) => {
        this.channelBadges = {
          subscriber: data.subscriber_badges,
          bits: data.bits_badges,
        };
      })
      .catch((e) => {
        console.error(e);
      });
  };

  onReady = (evt) => {
    this.player = evt.target;
    if (this.state.vodData.youtube[this.state.part]) {
      this.player.loadVideoById(this.state.vodData.youtube[this.state.part].id);
    } else {
      this.setState({ part: 0 }, () => {
        this.player.loadVideoById(this.state.vodData.youtube[this.state.part].id);
      });
    }
    canAutoPlay.video().then(({ result }) => {
      if (!result) {
        evt.target.mute();
      }
    });
  };

  onPlay = async (evt) => {
    let offset = Math.round(this.player.getCurrentTime());
    for (let i = 0; i < this.state.part; i++) {
      offset += this.state.vodData.youtube[i].duration;
    }
    this.setState(
      {
        messages: [],
        comments: [],
        stoppedAtIndex: 0,
        chatLoading: true,
      },
      () => {
        this.fetchComments(offset);
        this.loop();
      }
    );
  };

  onEnd = (evt) => {
    this.clearLoopTimeout();
    const nextPart = this.state.part + 1;
    if (this.state.vodData.youtube[nextPart].id) {
      this.setState({ part: nextPart });
      this.player.loadVideoById(this.state.vodData.youtube[nextPart].id);
    }
  };

  playerError = (evt) => {
    console.error(evt.data);
  };

  clearLoopTimeout = (evt) => {
    clearTimeout(this.loopTimeout);
  };

  fetchComments = async (offset) => {
    await fetch(
      `https://archive.overpowered.tv/${this.channel}/v1/vods/${this.vodId}/comments?content_offset_seconds=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          chatLoading: false,
          comments: data.comments,
          cursor: data.cursor,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  fetchNextComments = async () => {
    await fetch(
      `https://archive.overpowered.tv/${this.channel}/v1/vods/${this.vodId}/comments?cursor=${this.state.cursor}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          comments: this.state.comments.concat(data.comments),
          cursor: data.cursor,
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  transformBadges = (badges) => {
    if (!badges) return null;
    let badgeWrapper = [];
    for (const badge of badges) {
      if (this.channelBadges) {
        const channelBadge = this.channelBadges[badge._id];
        if (channelBadge) {
          if (channelBadge[badge.version]) {
            badgeWrapper.push(
              <img
                key={this.badgesCount++}
                crossOrigin="anonymous"
                className={this.props.classes.badges}
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

      const twitchBadge = this.badgeSets[badge._id];
      if (twitchBadge) {
        badgeWrapper.push(
          <img
            key={this.badgesCount++}
            crossOrigin="anonymous"
            className={this.props.classes.badges}
            src={`${this.BASE_TWITCH_CDN}badges/v1/${
              twitchBadge.versions[badge.version]
                ? twitchBadge.versions[badge.version].image_url_1x
                : twitchBadge.versions[0].image_url_1x
            }`}
            srcSet={`${this.BASE_TWITCH_CDN}badges/v1/${
              twitchBadge.versions[badge.version]
                ? twitchBadge.versions[badge.version].image_url_1x
                : twitchBadge.versions[0].image_url_1x
            } 1x, ${this.BASE_TWITCH_CDN}badges/v1/${
              twitchBadge.versions[badge.version]
                ? twitchBadge.versions[badge.version].image_url_2x
                : twitchBadge.versions[0].image_url_2x
            } 2x, ${this.BASE_TWITCH_CDN}badges/v1/${
              twitchBadge.versions[badge.version]
                ? twitchBadge.versions[badge.version].image_url_4x
                : twitchBadge.versions[0].image_url_4x
            } 4x`}
            alt=""
          />
        );
      }
    }

    return <span>{badgeWrapper}</span>;
  };

  transformMessage = (messageFragments) => {
    const textFragments = [];
    for (let messageFragment of messageFragments) {
      if (!messageFragment.emoticon) {
        let messageArray = messageFragment.text.split(" ");
        for (let message of messageArray) {
          let found;
          if (this.FFZEmotes) {
            for (let ffz_emote of this.FFZEmotes) {
              if (message === ffz_emote.name) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      crossOrigin="anonymous"
                      className={this.props.classes.chatEmote}
                      src={`https:${ffz_emote.urls["1"]}`}
                      srcSet={`https:${ffz_emote.urls["1"]} 1x, https:${ffz_emote.urls["2"]} 2x, https:${ffz_emote.urls["4"]} 4x`}
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

          if (this.BTTVGlobalEmotes) {
            for (let bttv_emote of this.BTTVGlobalEmotes) {
              if (message === bttv_emote.code) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      className={this.props.classes.chatEmote}
                      src={`${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/1x`}
                      srcSet={`${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/1x 1x, ${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/2x 2x, ${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/3x 4x`}
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

          if (this.BTTVEmotes) {
            for (let bttv_emote of this.BTTVEmotes) {
              if (message === bttv_emote.code) {
                found = true;
                textFragments.push(
                  <div key={this.messageCount++} style={{ display: "inline" }}>
                    <img
                      className={this.props.classes.chatEmote}
                      src={`${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/1x`}
                      srcSet={`${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/1x 1x, ${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/2x 2x, ${this.BASE_BTTV_CDN}emote/${bttv_emote.id}/3x 4x`}
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

          textFragments.push(
            <span key={this.messageCount++}>{`${message} `}</span>
          );
        }
      } else {
        textFragments.push(
          <div key={this.messageCount++} style={{ display: "inline" }}>
            <img
              crossOrigin="anonymous"
              className={this.props.classes.chatEmote}
              src={`${this.BASE_TWITCH_CDN}emoticons/v1/${messageFragment.emoticon.emoticon_id}/1.0`}
              srcSet={
                messageFragment.emoticon.emoticon_set_id
                  ? `${this.BASE_TWITCH_CDN}emoticons/v1/${messageFragment.emoticon.emoticon_set_id}/1.0 1x, ${this.BASE_TWITCH_CDN}emoticons/v1/${messageFragment.emoticon.emoticon_set_id}/2.0 2x`
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

  buildMessages = async () => {
    if (!this.player || !this.state.comments) return;
    const playerState = this.player.getPlayerState();
    if (
      this.state.comments.length === 0 ||
      playerState === -1 ||
      playerState === 0 ||
      playerState === 5
    )
      return;

    let playerCurrentTime = Math.round(this.player.getCurrentTime());
    for (let i = 0; i < this.state.part; i++) {
      playerCurrentTime += this.state.vodData.youtube[i].duration;
    }

    let pastIndex = this.state.comments.length - 1;
    for (
      let i = this.state.stoppedAtIndex.valueOf();
      i < this.state.comments.length;
      i++
    ) {
      const comment = this.state.comments[i];
      if (comment.content_offset_seconds > playerCurrentTime) {
        pastIndex = i;
        break;
      }
    }

    if (this.state.comments.length - 1 === pastIndex) {
      await this.fetchNextComments();
    }
    if (
      this.state.stoppedAtIndex === pastIndex &&
      this.state.stoppedAtIndex !== 0
    )
      return;

    let messages = this.state.messages.slice(0);

    for (let i = this.state.stoppedAtIndex.valueOf(); i < pastIndex; i++) {
      if (messages.length > 75) {
        messages.splice(0, 1);
      }
      const comment = this.state.comments[i];
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
                  {this.transformBadges(comment.user_badges)}
                  <div
                    style={{
                      color: "#615b5b",
                      textDecoration: "none",
                      display: "inline",
                    }}
                  >
                    <span
                      style={{ color: comment.user_color, fontWeight: "700" }}
                    >
                      {comment.display_name}
                    </span>
                  </div>
                  <Box display="inline">
                    <span>: </span>
                    {this.transformMessage(comment.message)}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </li>
      );
    }

    this.setState(
      {
        messages: messages,
        stoppedAtIndex: pastIndex,
      },
      () => {
        this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight;
      }
    );
  };

  loop = () => {
    this.loopTimeout = setTimeout(async () => {
      await this.buildMessages();
      this.loop();
    }, 1000);
  };

  render() {
    const { classes, isMobile } = this.props;
    const { vodData, chatLoading, messages } = this.state;
    return !vodData ? (
      <div className={classes.parent}>
        <div style={{ textAlign: "center" }}>
          <div>
            <img alt="" src={Logo} height="auto" width="75%" />
          </div>
          <CircularProgress style={{ marginTop: "2rem" }} size="2rem" />
        </div>
      </div>
    ) : (
      <Container maxWidth={false} disableGutters style={{ height: "100%" }}>
        <Box display={isMobile ? "block" : "flex"} className={classes.player}>
          <Youtube
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
            onReady={this.onReady}
            onPlay={this.onPlay}
            onPause={this.clearLoopTimeout}
            onEnd={this.onEnd}
            onError={this.playerError}
          />
          <div className={!isMobile ? classes.horizChat : classes.vertChat}>
            {chatLoading ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: isMobile ? "3rem" : "20vh",
                }}
              >
                <CircularProgress size="3rem" />
              </div>
            ) : (
              <div className={classes.chat}>
                <SimpleBar
                  scrollableNodeProps={{ ref: this.chatRef }}
                  className={classes.scroll}
                >
                  <Box
                    display="flex"
                    height="100%"
                    justifyContent="flex-end"
                    flexDirection="column"
                  >
                    <ul className={classes.ul}>{messages}</ul>
                  </Box>
                </SimpleBar>
              </div>
            )}
          </div>
        </Box>
      </Container>
    );
  }
}

const useStyles = () => ({
  parent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
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
});

const withMediaQuery = (...args) => (Component) => (props) => {
  const mediaQuery = useMediaQuery(...args);
  return <Component isMobile={mediaQuery} {...props} />;
};

export default withStyles(useStyles)(
  withMediaQuery("(max-width: 900px)")(VodPlayer)
);
