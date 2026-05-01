import { useState } from 'react';
import Submission from './submission';
import Edit from './edit';
import Creation from './creation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';

export default function IsolatedModal(props) {
  const [modal, setModal] = useState(false);
  const { user, type, contest, submission } = props;

  const handleOpen = () => {
    setModal(true);
  };

  const handleClose = () => {
    setModal(false);
  };

  return (
    <>
      {type === 'Creation' && (
        <Button onClick={handleOpen} variant="contained">
          Create Contest
        </Button>
      )}

      {type === 'Edit' && (
        <Button onClick={handleOpen} variant="contained" color="secondary">
          Edit
        </Button>
      )}

      {type === 'Submit' && (
        <Button disabled={!contest.submission || !user} onClick={handleOpen} variant="contained">
          Submit
        </Button>
      )}

      {type === 'Modify' && (
        <Button disabled={!contest.submission || !user} onClick={handleOpen} variant="contained">
          Modify
        </Button>
      )}

      <Modal open={modal} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          {type === 'Creation' && <Creation user={user} />}
          {type === 'Submit' && <Submission user={user} contest={contest} type={'Submission'} />}
          {type === 'Edit' && <Edit user={user} contest={contest} />}
          {type === 'Modify' && <Submission user={user} contest={contest} submission={submission} type={'Modify'} />}
        </Box>
      </Modal>
    </>
  );
}
