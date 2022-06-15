import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Box } from "@mui/material";

export default function YoutubePlayer(props) {
  const { submission, show } = props;
  const player = useRef(undefined);
  const [showPlayer, setShowPlayer] = useState(show === undefined ? false : show);

  const onReady = (evt) => {
    player.current = evt.target;

    player.current.cueVideoById(
      submission.video.end != null
        ? {
            videoId: submission.video.id,
            startSeconds: submission.video.start != null ? submission.video.start : 0,
            endSeconds: submission.video.end,
          }
        : {
            videoId: submission.video.id,
            startSeconds: submission.video.start != null ? submission.video.start : 0,
          }
    );
  };

  useEffect(() => {
    if (!submission || !player.current) return;
    if (show === undefined) setShowPlayer(false);
    
    player.current.cueVideoById(
      submission.video.end
        ? {
            videoId: submission.video.id,
            startSeconds: submission.video.start ? submission.video.start : 0,
            endSeconds: submission.video.end,
          }
        : {
            videoId: submission.video.id,
            startSeconds: submission.video.start ? submission.video.start : 0,
          }
    );
  }, [submission, show]);

  const handlePlayerClick = (_) => {
    setShowPlayer(true);
  };

  return (
    <Box
      sx={{
        backgroundColor: "black",
        aspectRatio: "16/9",
        height: "100%",
        width: "100%",
      }}
      onClick={handlePlayerClick}
    >
      <YouTube
        id="player"
        className={`youtube-player ${!showPlayer ? "hidden" : ""}`}
        opts={{
          height: "100%",
          width: "100%",
          playerVars: {
            autoplay: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
        }}
        onReady={onReady}
      />
    </Box>
  );
}
