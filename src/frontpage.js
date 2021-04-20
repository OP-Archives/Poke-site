import React from "react";
import SimpleBar from "simplebar-react";
import { makeStyles, Box, Typography, useMediaQuery } from "@material-ui/core";
import merch1 from "./assets/merch/merch1.png";
import merch2 from "./assets/merch/merch2.png";
import merch3 from "./assets/merch/merch3.png";
import merch4 from "./assets/merch/merch4.png";

const merchImages = [
  {
    image: merch1,
    link:
      "https://metathreads.com/collections/pokelawls/products/pokelawls-smoke-black-tee",
  },
  {
    image: merch2,
    link:
      "https://metathreads.com/collections/pokelawls/products/pokelawls-kisses-black-tee",
  },
  {
    image: merch3,
    link:
      "https://metathreads.com/collections/pokelawls/products/pokelawls-kisses-white-tee",
  },
  {
    image: merch4,
    link:
      "https://metathreads.com/collections/pokelawls/products/pokelawls-kisses-black-hoodie",
  },
];

export default function Frontpage() {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 800px)");

  return (
    <Box className={classes.root}>
      <SimpleBar style={{ height: "100%" }}>
        <div className={classes.wrapper}>
          <div className={classes.column}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Box
                display="flex"
                flexDirection="column"
                marginTop="5rem"
                width={`${isMobile ? "100%" : "50%"}`}
              >
                <div className={`${classes.header} ${classes.linkText}`}>
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
                <div className={classes.container}>
                  <div className={classes.row}>
                    <div className={classes.form}>
                      <Box display="flex" flexWrap="nowrap">
                        {merchImages.map((item, index) => {
                          return (
                            <div className={classes.hover}>
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
                  frameborder="no"
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
});
