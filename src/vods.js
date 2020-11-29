import React, { useEffect } from "react";
import {
  makeStyles,
  Typography,
  Link,
  Container,
  Button,
} from "@material-ui/core";
import SimpleBar from "simplebar-react";
import Loader from "react-loader-spinner";

export default function Vods(props) {
  const classes = useStyles();
  const [vods, setVods] = React.useState([]);
  const [skip, setSkip] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [vodList, setVodList] = React.useState([]);
  const [allVodsLoaded, setAllVodsLoaded] = React.useState(false);

  useEffect(() => {
    document.title = "VODS - Poke";
    const fetchVods = async () => {
      await fetch("https://archive.overpowered.tv/poke/vods?$limit=50&$sort[createdAt]=-1", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          //don't display vods without a video link
          setVodList(data.data.filter((vod) =>  {
            return vod.youtube_id.length != 0;
          }));
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [classes]);

  useEffect(() => {
    setVods(
      vodList.map((vod, i) => {
        return (
          <div key={vod.id} className={classes.paper}>
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
                      className={classes.title}
                      href={`/vods/${vod.id}`}
                      variant="caption"
                    >
                      {vod.title}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.imageBox}>
              <Link href={`/vods/${vod.id}`}>
                <img alt="" src={vod.thumbnail_url} className={classes.image} />
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
    setLoading(false);
    return;
  }, [vodList, classes]);

  const fetchNextVods = async () => {
    if(allVodsLoaded) return;
    let next = skip + 50;
    await fetch(
      `https://archive.overpowered.tv/poke/vods?$limit=50&$skip=${next}&$sort[createdAt]=-1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if(data.data.length === 0) {
          setAllVodsLoaded(true);
          return;
        }
        //don't display vods without a video link
        setVodList(vodList.concat(data.data.filter((vod) => vod.video_link)));
      })
      .catch((e) => {
        console.error(e);
      });
    setSkip(next);
  };

  return loading ? (
    <div style={{ padding: "30vh 0", textAlign: "center" }}>
      <Loader type="Oval" color="#00BFFF" height={150} width={150} />
      <h2 style={{ color: "#fff", marginTop: "2rem", fontSize: "2rem" }}>
        Loading...
      </h2>
    </div>
  ) : (
    <Container maxWidth={false} disableGutters style={{ height: "100%" }}>
      <SimpleBar className={classes.scroll}>
        <Typography className={classes.header} variant="h4">
          {`Vods`}
        </Typography>
        <div className={classes.root}>{vods}</div>
        {!allVodsLoaded ? (
          <div className={classes.center}>
            <Button
              onClick={fetchNextVods}
              variant="contained"
              color="primary"
              className={classes.loadMore}
            >
              Load More
            </Button>
          </div>
        ) : (
          <></>
        )}
      </SimpleBar>
    </Container>
  );
}

const useStyles = makeStyles(() => ({
  root: {
    marginLeft: "2rem",
    marginTop: "2rem",
    display: "flex",
    flexWrap: "wrap",
    height: "100%",
  },
  center: {
    textAlign: "center",
  },
  loadMore: {
    color: `#fff`,
    "&:hover": {
      opacity: "0.7",
    },
    whiteSpace: "nowrap",
    textTransform: "none",
  },
  header: {
    marginTop: "3rem",
    marginLeft: "2rem",
    color: "#fff",
  },
  page: {
    marginTop: "2rem",
    marginLeft: "2rem",
    color: "#fff",
  },
  paper: {
    maxWidth: "30%",
    width: "18rem",
    flex: "0 0 auto",
    padding: "0 .5rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
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
  },
  image: {
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
    marginBottom: "2rem",
  },
  scroll: {
    height: "calc(100% - 4rem)",
    position: "relative",
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
  cornerText: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,.6)",
    padding: "0 .2rem",
  },
}));
