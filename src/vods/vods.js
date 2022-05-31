import React, { useEffect } from "react";
import { Box, Pagination, Grid, useMediaQuery } from "@mui/material";
import SimpleBar from "simplebar-react";
import ErrorBoundary from "../utils/ErrorBoundary";
import AdSense from "react-adsense";
import Footer from "../utils/Footer";
import Loading from "../utils/Loading";
import Vod from "./Vod";

const limit = 50;

export default function Vods(props) {
  const { VODS_API_BASE, channel } = props;
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [vods, setVods] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(null);
  const [totalPages, setTotalPages] = React.useState(null);

  useEffect(() => {
    document.title = `VODS - ${channel}`;
    const fetchVods = async () => {
      await fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$sort[createdAt]=-1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setPage(1);
          setVods(response.data);
          setTotalPages(Math.ceil(response.total / limit));
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchVods();
    return;
  }, [VODS_API_BASE, channel]);

  const handlePageChange = (_, value) => {
    if (page === value) return;
    setLoading(true);
    setPage(value);

    fetch(`${VODS_API_BASE}/vods?$limit=${limit}&$skip=${(value - 1) * limit}&$sort[createdAt]=-1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.data.length === 0) return;
        setVods(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  if (loading) return <Loading />;

  return (
    <SimpleBar style={{ minHeight: 0 }}>
      <Box sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
        <Grid container spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
          {vods.map((vod, i) => (
            <Vod gridSize={2.1} key={vod.id} vod={vod} isMobile={isMobile} />
          ))}
        </Grid>
        <Box sx={{ display: "flex", mt: 1, justifyContent: "center" }}>
          <ErrorBoundary>
            <AdSense.Google client="ca-pub-8093490837210586" slot="3667265818" style={{ display: "block" }} format="auto" responsive="true" layoutKey="-gw-1+2a-9x+5c" />
          </ErrorBoundary>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        {totalPages !== null && <Pagination count={totalPages} disabled={totalPages <= 1} color="primary" page={page} onChange={handlePageChange} />}
      </Box>
      <Footer />
    </SimpleBar>
  );
}
