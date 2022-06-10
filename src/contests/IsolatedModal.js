import { useState } from "react";
import { Box, Button, Modal } from "@mui/material";
import Submission from "./submission";
import Edit from "./edit";

export default function IsolatedModal(props) {
  const [modal, setModal] = useState(false);
  const { user, type, contest } = props;

  const handleOpen = () => {
    setModal(true);
  };

  const handleClose = () => {
    setModal(false);
  };

  return (
    <>
      {type === "Edit" && (
        <Button onClick={handleOpen} variant="contained" color="secondary">
          Edit
        </Button>
      )}

      {type === "Submit" && (
        <Button disabled={!contest.submission || !user} onClick={handleOpen} variant="contained">
          Submit
        </Button>
      )}

      {type === "Modify" && (
        <Button disabled={!contest.submission || !user} onClick={handleOpen} variant="contained">
          Modify
        </Button>
      )}

      <Modal open={modal} onClose={handleClose}>
        <Box>
          {type === "Submit" && <Submission user={user} contest={contest} type={"Submission"} />}
          {type === "Edit" && <Edit user={user} contest={contest} />}
          {type === "Modify" && <Submission user={user} contest={contest} submission={contest.submission} type={"Modify"} />}
        </Box>
      </Modal>
    </>
  );
}
