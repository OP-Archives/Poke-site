import { useState } from "react";
import { Drawer, ListItem, List, ListItemText, IconButton, Divider, Box, Link, ListItemIcon } from "@mui/material";
import { Menu } from "@mui/icons-material";
import TwitterIcon from "@mui/icons-material/Twitter";
import SvgIcon from "@mui/material/SvgIcon";
import RedditIcon from "@mui/icons-material/Reddit";
import YouTubeIcon from "@mui/icons-material/YouTube";
import HomeIcon from "@mui/icons-material/Home";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StoreIcon from "@mui/icons-material/Store";
import ReportIcon from "@mui/icons-material/Report";

const mainLinks = [
  { title: `Home`, path: `/`, icon: <HomeIcon color="primary" /> },
  { title: `Vods`, path: `/vods`, icon: <OndemandVideoIcon color="primary" /> },
  { title: `Contests`, path: `/contests`, icon: <EmojiEventsIcon color="primary" /> },
  { title: `Merch`, path: `https://dotexe.com/collections/pokelawls`, icon: <StoreIcon color="primary" /> },
  { title: `Report an Issue`, path: `${process.env.REACT_APP_GITHUB}/issues`, icon: <ReportIcon color="primary" /> },
];

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

export default function DrawerComponent() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ mr: 1 }}>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          {mainLinks.map(({ title, path, icon }) => (
            <Box key={title}>
              <ListItem onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>
                  <Link color="primary" href={path}>
                    {title}
                  </Link>
                </ListItemText>
              </ListItem>
              <Divider />
            </Box>
          ))}
          <Divider />
          <Box sx={{ display: "flex", p: 2 }}>
            {socials.map(({ path, icon }) => (
              <Box key={path} sx={{ mr: 2 }}>
                <Link href={path} rel="noopener noreferrer" target="_blank">
                  {icon}
                </Link>
              </Box>
            ))}
          </Box>
        </List>
      </Drawer>
      <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
        <Menu color="primary" />
      </IconButton>
    </Box>
  );
}
