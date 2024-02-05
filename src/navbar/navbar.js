import React from "react";
import { AppBar, Toolbar, Typography, useMediaQuery, Box, Divider } from "@mui/material";
import Logo from "../assets/jammin.gif";
import CustomLink from "../utils/CustomLink";
import TwitterIcon from "@mui/icons-material/Twitter";
import SvgIcon from "@mui/material/SvgIcon";
import RedditIcon from "@mui/icons-material/Reddit";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Drawer from "./drawer";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ReportIcon from "@mui/icons-material/Report";

const socials = [
  { path: `https://reddit.com/r/pokelawls`, icon: <RedditIcon color="primary" /> },
  { path: `https://youtube.com/c/pokelawls`, icon: <YouTubeIcon color="primary" /> },
  {
    path: `https://soundcloud.com/pokelawls`,
    icon: (
      <SvgIcon color="primary">
        <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-2.233-2.168-3.772-4.121-2.815zm-16.879-.027c-.302-.024-.526-.03-1 .122v5.689c.446.143.636.138 1 .138v-5.949z" />
      </SvgIcon>
    ),
  },
  {
    path: `https://twitter.com/pokelawls`,
    icon: <TwitterIcon color="primary" />,
  },
  {
    path: `https://twitch.tv/pokelawls`,
    icon: (
      <SvgIcon color="primary">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </SvgIcon>
    ),
  },
];

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width: 800px)");

  return (
    <Box sx={{ flex: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            {isMobile && <Drawer socials={socials} />}

            <Box sx={{ mr: 2 }}>
              <a href="/">
                <img alt="" style={{ maxWidth: "45px", height: "auto" }} src={Logo} />
              </a>
            </Box>

            <Typography variant="h6" component="div">
              <CustomLink color="inherit" href="/">
                <Typography color="primary" variant="h6">
                  Poke
                </Typography>
              </CustomLink>
            </Typography>

            {!isMobile && (
              <>
                <Divider orientation="vertical" flexItem variant="middle" sx={{ ml: 1, mr: 1 }} />

                {socials.map(({ path, icon }) => (
                  <Box key={path} sx={{ mr: 2 }}>
                    <CustomLink href={path} rel="noopener noreferrer" target="_blank">
                      {icon}
                    </CustomLink>
                  </Box>
                ))}
              </>
            )}
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <Box sx={{ mr: 2 }}>
                <CustomLink href="/contests">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <EmojiEventsIcon color="primary" sx={{ mr: 0.5 }} />
                    <Typography color="primary" variant="h6">
                      Contests
                    </Typography>
                  </Box>
                </CustomLink>
              </Box>
              <Box sx={{ mr: 2 }}>
                <CustomLink href="/vods">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <OndemandVideoIcon color="primary" sx={{ mr: 0.5 }} />
                    <Typography color="primary" variant="h6">
                      Vods
                    </Typography>
                  </Box>
                </CustomLink>
              </Box>
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: "flex", justifyContent: "end", flex: 1 }}>
              <Box sx={{ mr: 2 }}>
                <CustomLink href={`${process.env.REACT_APP_GITHUB}/issues`} rel="noopener noreferrer" target="_blank">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <ReportIcon color="primary" sx={{ mr: 0.5 }} />
                    <Typography color="primary" variant="h6">
                      Issues
                    </Typography>
                  </Box>
                </CustomLink>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
