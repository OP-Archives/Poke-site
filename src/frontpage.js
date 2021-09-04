import React, { useEffect } from "react";
import SimpleBar from "simplebar-react";
import {
  makeStyles,
  Box,
  Typography,
  useMediaQuery,
  Link,
} from "@material-ui/core";
import merch1 from "./assets/merch/merch1.png";
import merch2 from "./assets/merch/merch2.png";
import merch3 from "./assets/merch/merch3.png";
import merch4 from "./assets/merch/merch4.png";
import ErrorBoundary from "./ErrorBoundary.js";
import AdSense from "react-adsense";

const merchImages = [
  {
    image: merch1,
    link: "https://metathreads.com/collections/pokelawls/products/pokelawls-smoke-black-tee",
  },
  {
    image: merch2,
    link: "https://metathreads.com/collections/pokelawls/products/pokelawls-kisses-black-tee",
  },
  {
    image: merch3,
    link: "https://metathreads.com/collections/pokelawls/products/pokelawls-kisses-white-tee",
  },
  {
    image: merch4,
    link: "https://metathreads.com/collections/pokelawls/products/pokelawls-kisses-black-hoodie",
  },
];

export default function Frontpage(props) {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 800px)");
  const channel = props.channel;
  const [vodList, setVodList] = React.useState([]);
  const [vods, setVods] = React.useState([]);

  useEffect(() => {
    const fetchVods = async () => {
      await fetch(
        `https://archive.overpowered.tv/${channel}/vods?$limit=10&$sort[createdAt]=-1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          //don't display vods without a video link
          setVodList(
            data.data
              .filter((vod) => {
                return vod.youtube.length !== 0;
              })
              .slice(0, 3)
          );
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [classes, channel]);

  useEffect(() => {
    if (!vodList) return;
    if (vodList.length === 0) return;
    setVods(
      vodList.map((vod, i) => {
        return (
          <div
            key={vod.id}
            style={{ width: isMobile ? "6rem" : "18rem" }}
            className={classes.paper}
          >
            <div className={classes.lower}>
              <div style={{ display: "flex", flexWrap: "nowrap" }}>
                <div
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    width: "100%",
                    order: 2,
                    minWidth: 0,
                  }}
                >
                  <div style={{ marginBottom: "0.1rem" }}>
                    <Link
                      className={classes.title2}
                      href={`/${vod.youtube.some(youtube => youtube.type === "live") ? "live" : "vods"}/${vod.id}`}
                      variant="caption"
                    >
                      {vod.title}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.imageBox}>
              <Link href={`/${vod.youtube.some(youtube => youtube.type === "live") ? "live" : "vods"}/${vod.id}`}>
                <img
                  alt=""
                  src={vod.thumbnail_url}
                  className={classes.image2}
                />
              </Link>
              <div className={classes.corners}>
                <div className={classes.bottomLeft}>
                  <Typography variant="caption" className={classes.cornerText}>
                    {`${vod.date}`}
                  </Typography>
                </div>
              </div>
              <div className={classes.corners}>
                <div className={classes.bottomRight}>
                  <Typography variant="caption" className={classes.cornerText}>
                    {`${vod.duration}`}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        );
      })
    );
    return;
  }, [vodList, classes, isMobile]);

  return (
    <Box className={classes.root}>
      <SimpleBar style={{ height: "100%" }}>
        <div id="top-ad-banner" className={classes.topAdBanner}>
          <ErrorBoundary>
            {isMobile ? (
              <AdSense.Google
                key="top-ad"
                client="ca-pub-8093490837210586"
                slot="3667265818"
                style={{
                  border: "0px",
                  verticalAlign: "bottom",
                  width: "300px",
                  height: "100px",
                }}
                format=""
              />
            ) : (
              <AdSense.Google
                key="top-ad"
                client="ca-pub-8093490837210586"
                slot="3667265818"
                style={{
                  border: "0px",
                  verticalAlign: "bottom",
                  width: "728px",
                  height: "90px",
                }}
                format=""
              />
            )}
          </ErrorBoundary>
        </div>
        <div className={classes.wrapper}>
          <div className={classes.column}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Box
                display="flex"
                flexDirection="column"
                width={`${isMobile ? "100%" : "50%"}`}
              >
                <div className={classes.container}>
                  <div className={classes.row}>
                    <div className={classes.form}>
                      <Box
                        display="flex"
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        <div
                          className={`${classes.header} ${classes.linkText}`}
                        >
                          <a href="/vods">
                            <Typography className={classes.alt} variant="h6">
                              Most Recent Vods
                            </Typography>
                          </a>
                        </div>
                      </Box>
                      <Box display="flex" marginTop="1rem">
                        {vods}
                      </Box>
                    </div>
                  </div>
                </div>
              </Box>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Box
                display="flex"
                flexDirection="column"
                width={`${isMobile ? "100%" : "50%"}`}
              >
                <div className={classes.container}>
                  <div className={classes.row}>
                    <div className={classes.form}>
                      <Box
                        display="flex"
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        <div
                          className={`${classes.header} ${classes.linkText}`}
                        >
                          <a
                            href="https://metathreads.com/collections/pokelawls"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Typography className={classes.alt} variant="h4">
                              Merch
                            </Typography>
                          </a>
                        </div>
                      </Box>
                      <Box display="flex" flexWrap="nowrap">
                        {merchImages.map((item, index) => {
                          return (
                            <div key={index} className={classes.hover}>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer noopener"
                              >
                                <img
                                  alt=""
                                  key={index}
                                  src={item.image}
                                  className={classes.image}
                                />
                              </a>
                            </div>
                          );
                        })}
                      </Box>
                    </div>
                  </div>
                </div>
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Box
                display="flex"
                flexDirection="column"
                width={`${isMobile ? "100%" : "50%"}`}
              >
                <iframe
                  title="Player"
                  width="100%"
                  height="160"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/910917202&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
                />
              </Box>
            </Box>
          </div>
          <div className={classes.footer}>
            <div style={{ marginTop: "0.5rem" }}>
              <Typography variant="caption" className={classes.alt}>
                Pokelawls ©
              </Typography>
            </div>
            <a
              className={classes.navigation}
              target="_blank"
              rel="noopener noreferrer"
              href="https://twitter.com/overpowered"
            >
              <Typography variant="caption" className={classes.alt}>
                made by OP with 💜
              </Typography>
            </a>
          </div>
        </div>
      </SimpleBar>
    </Box>
  );
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "calc(100% - 5rem)",
    overflow: "hidden",
    width: "100%",
    flexDirection: "column",
    flexGrow: 1,
  },
  wrapper: {
    position: "relative",
    marginLeft: "2rem",
    marginRight: "2rem",
  },
  column: {
    maxWidth: "200rem",
    margin: "0 auto",
    marginTop: "5rem",
  },
  header: {
    marginBottom: "0.5rem",
    fontWeight: "600",
    alignSelf: "start",
  },
  title: {
    marginTop: "2rem",
  },
  navigation: {
    color: "#3c70ff",
    "&:hover": {
      opacity: "0.7",
    },
  },
  mobile: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "sapce-evenly",
    textAlign: "center",
    flexWrap: "wrap",
  },
  notMobile: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-evenly",
    textAlign: "center",
  },
  feature: {
    maxWidth: "190px",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    marginRight: "2rem",
    marginLeft: "2rem",
  },
  featureMobile: {
    flex: "1 1 33%",
    marginBottom: "2rem",
    width: "18%",
    maxWidth: "190px",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    marginRight: "2rem",
    marginLeft: "2rem",
  },
  svg: {
    fill: "#2079ff",
    fontSize: "5rem",
  },
  featureText: {
    alignItems: "center",
    display: "flex",
    marginTop: "0.5rem",
    flexDirection: "column",
  },
  bold: {
    fontWeight: "600",
  },
  alt: {
    marginTop: "0.5rem",
    color: "hsl(0 0% 100%/.8)",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "2rem",
    marginRight: "2rem",
    marginTop: "5rem",
  },
  row: {
    padding: "1rem",
  },
  form: {
    flexGrow: 1,
    position: "relative",
  },
  container: {
    backgroundColor: "#1d1d1d",
    borderLeft: "1px solid hsla(0,0%,100%,.1)",
    borderRight: "1px solid hsla(0,0%,100%,.1)",
    borderTop: "1px solid hsla(0,0%,100%,.1)",
    borderBottom: "1px solid hsla(0,0%,100%,.1)",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    marginBottom: "3rem",
    paddingBottom: "1.5rem",
  },
  linkText: {
    textDecoration: `none`,
    color: `#fff`,
    "&:hover": {
      opacity: "50%",
    },
  },
  image: {
    marginRight: "2rem",
    marginTop: "2rem",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  hover: {
    "&:hover": {
      boxShadow: "0 0 8px #fff",
    },
  },
  flexCenter: {
    justifyContent: "center",
    alignContent: "center",
  },
  center: {
    textAlign: "center",
  },
  paper: {
    maxWidth: "30%",
    flex: "0 0 auto",
    padding: "0 .5rem",
    display: "flex",
    flexDirection: "column",
  },
  title2: {
    color: "#fff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },
  imageBox: {
    overflow: "hidden",
    height: 0,
    paddingTop: "56.25%",
    position: "relative",
    order: 1,
    "&:hover": {
      boxShadow: "0 0 8px #fff",
    },
  },
  image2: {
    verticalAlign: "top",
    maxWidth: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  lower: {
    order: 2,
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  corners: {
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    marginLeft: "5px",
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginRight: "5px",
  },
  topAdBanner: {
    textAlign: "center",
    marginBottom: "0px",
    marginTop: "30px",
    border: "0pt none",
  },
});
