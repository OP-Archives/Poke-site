import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

export default function TikTokPlayer(props) {
  const { submission, show } = props;
  const [showPlayer, setShowPlayer] = useState(show === undefined ? false : show);

  useEffect(() => {
    if (!submission) return;
    if (show === undefined) setShowPlayer(false);
  }, [submission, show]);

  const handlePlayerClick = (_) => {
    setShowPlayer(true);
  };

  return (
    <Box
      sx={{
        backgroundColor: "black",
        aspectRatio: "9/16",
        maxWidth: "325px",
        height: "575px",
      }}
      onClick={handlePlayerClick}
    >
      <iframe
        className={!showPlayer ? "hidden" : ""}
        title="Player"
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="no"
        allowFullScreen
        src={`https://tiktok.com/embed/${submission.video.id}`}
      />
    </Box>
  );
}
