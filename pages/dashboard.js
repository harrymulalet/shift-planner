import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Alert, Button, CircularProgress, Container, Dialog, DialogContent, DialogActions, Divider, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavBar from '../components/navbar';
import ShiftRow from '../components/shiftRow';
import ShiftDialog from '../components/shiftDialog';
import { useAuth } from '../firebase/auth';
import { deleteShift, getShifts } from '../firebase/firestore';
import styles from '../styles/dashboard.module.scss';

const ADD_SUCCESS = "Shift was successfully booked!";
const ADD_ERROR = "Shift was not successfully booked!";
const EDIT_SUCCESS = "Shift was successfully updated!";
const EDIT_ERROR = "Shift was not successfully updated!";
const DELETE_SUCCESS = "Shift booking successfully cancelled!";
const DELETE_ERROR = "Shift booking not successfully cancelled!";

export const SHIFTS_ENUM = Object.freeze({
  none: 0,
  add: 1,
  edit: 2,
  delete: 3,
});

const SUCCESS_MAP = {
  [SHIFTS_ENUM.add]: ADD_SUCCESS,
  [SHIFTS_ENUM.edit]: EDIT_SUCCESS,
  [SHIFTS_ENUM.delete]: DELETE_SUCCESS
}

const ERROR_MAP = {
  [SHIFTS_ENUM.add]: ADD_ERROR,
  [SHIFTS_ENUM.edit]: EDIT_ERROR,
  [SHIFTS_ENUM.delete]: DELETE_ERROR
}

export default function Dashboard() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const [action, setAction] = useState(SHIFTS_ENUM.none);
  
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);
  const [deleteShiftId, setDeleteShiftId] = useState("");
  const [shifts, setShifts] = useState([]);
  const [updateShift, setUpdateShift] = useState({});

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSuccessSnackbar, setSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setErrorSnackbar] = useState(false);

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, isLoading])

  useEffect(async () => {
    if (authUser) {
      const unsubscribe = await getShifts(authUser.uid, setShifts, setIsLoadingShifts);
      return () => unsubscribe();
    }
  }, [authUser])

  const onResult = async (shiftEnum, isSuccess) => {
    setSnackbarMessage(isSuccess ? SUCCESS_MAP[shiftEnum] : ERROR_MAP[shiftEnum]);
    isSuccess ? setSuccessSnackbar(true) : setErrorSnackbar(true);
    setAction(SHIFTS_ENUM.none);
  }

  const onClickAdd = () => {
    setAction(SHIFTS_ENUM.add);
    setUpdateShift({});
  }

  const onUpdate = (shift) => {
    setAction(SHIFTS_ENUM.edit);
    setUpdateShift(shift);
  }

  const onClickDelete = (id) => {
    setAction(SHIFTS_ENUM.delete);
    setDeleteShiftId(id);
  }

  const resetDelete = () => {
    setAction(SHIFTS_ENUM.none);
    setDeleteShiftId("");
  }

  const onDelete = async () => {
    let isSucceed = true;
    try {
      await deleteShift(authUser.uid, deleteShiftId);
    } catch (error) {
      isSucceed = false;
    }
    resetDelete();
    onResult(SHIFTS_ENUM.delete, isSucceed);
  }

  return ((!authUser || isLoadingShifts) ?
    <CircularProgress color="inherit" sx={{ marginLeft: '50%', marginTop: '25%' }}/>
    :
    <div>
      <Head>
        <title>Hammonia Taxi Shift Planner</title>
      </Head>

      <NavBar />
      <Container>
        <Snackbar open={showSuccessSnackbar} autoHideDuration={1500} onClose={() => setSuccessSnackbar(false)}
                  anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
          <Alert onClose={() => setSuccessSnackbar(false)} severity="success">{snackbarMessage}</Alert>
        </Snackbar>
        <Snackbar open={showErrorSnackbar} autoHideDuration={1500} onClose={() => setErrorSnackbar(false)}
                  anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
          <Alert onClose={() => setErrorSnackbar(false)} severity="error">{snackbarMessage}</Alert>
        </Snackbar>
        <Stack direction="row" sx={{ paddingTop: "1.5em" }}>
          <Typography variant="h4" sx={{ lineHeight: 2, paddingRight: "0.5em" }}>
            TAXI SHIFTS
          </Typography>
          <IconButton aria-label="add" color="secondary" onClick={onClickAdd} className={styles.addButton}>
            <AddIcon />
          </IconButton>
        </Stack>
        { shifts.map((shift) => (
          <div key={shift.id}>
            <Divider light />
            <ShiftRow shift={shift}
                      onEdit={() => onUpdate(shift)}
                      onDelete={() => onClickDelete(shift.id)} />
          </div>)
        )}
      </Container>
      <ShiftDialog edit={updateShift}
                   showDialog={action === SHIFTS_ENUM.add || action === SHIFTS_ENUM.edit}
                   onError={(shiftEnum) => onResult(shiftEnum, false)}
                   onSuccess={(shiftEnum) => onResult(shiftEnum, true)}
                   onCloseDialog={() => setAction(SHIFTS_ENUM.none)}>
      </ShiftDialog>
      <Dialog open={action === SHIFTS_ENUM.delete} onClose={resetDelete}>
        <Typography variant="h4" className={styles.title}>CANCEL SHIFT BOOKING</Typography>
        <DialogContent>
            <Alert severity="error">This will permanently cancel your shift booking!</Alert>
        </DialogContent>
        <DialogActions sx={{ padding: '0 24px 24px'}}>
          <Button color="secondary" variant="outlined" onClick={resetDelete}>
              Cancel
          </Button>
          <Button color="secondary" variant="contained" onClick={onDelete} autoFocus>
              Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
