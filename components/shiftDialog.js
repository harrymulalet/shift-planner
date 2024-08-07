import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Stack, TextField, Typography, Select, MenuItem } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useAuth } from '../firebase/auth';
import { addShift } from '../firebase/firestore';
import { SHIFTS_ENUM } from '../pages/dashboard';
import styles from '../styles/shiftDialog.module.scss';

const DEFAULT_FORM_STATE = {
  startDate: null,
  endDate: null,
  taxiId: "",
  shift: "",
  driverType: "",
};

const TAXI_IDS = [
  "HH-QQ 705", "HH-QQ 708", "HH-QQ 710", "HH-QQ 713", "HH-QQ 714", "HH-QQ 715",
  "HH-QQ 719", "HH-QQ 720", "HH-QQ 723", "HH-QQ 724", "HH-QQ 725", "HH-QQ 726"
];

export default function ShiftDialog(props) {
  const isEdit = Object.keys(props.edit).length > 0;
  const { authUser } = useAuth();
  const [formFields, setFormFields] = useState(isEdit ? props.edit : DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (props.showDialog) {
      setFormFields(isEdit ? props.edit : DEFAULT_FORM_STATE);
    }
  }, [props.edit, props.showDialog])

  const isDisabled = () => !formFields.startDate || !formFields.endDate || !formFields.taxiId || !formFields.shift || !formFields.driverType;

  const updateFormField = (event, field) => {
    setFormFields(prevState => ({...prevState, [field]: event.target.value}))
  }

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { startDate, endDate } = formFields;
      const today = new Date();
      const startDaysDifference = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
      const endDaysDifference = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

      if (formFields.driverType === 'permanent') {
        if (startDaysDifference > 45 || startDaysDifference < 7 || endDaysDifference > 45 || endDaysDifference < 7) {
          throw new Error('Permanent drivers can only book 7-45 days in advance');
        }
      } else if (formFields.driverType === 'temporary') {
        if (startDaysDifference > 7 || endDaysDifference > 7) {
          throw new Error('Temporary drivers can only book up to 7 days in advance');
        }
      }

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        await addShift(authUser.uid, formFields.driverType, formFields.taxiId, new Date(currentDate), formFields.shift);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      props.onSuccess(SHIFTS_ENUM.add);
    } catch (error) {
      props.onError(SHIFTS_ENUM.add);
    }

    closeDialog();
  };

  return (
    <Dialog classes={{paper: styles.dialog}}
      onClose={closeDialog}
      open={props.showDialog}
      component="form">
      <Typography variant="h4" className={styles.title}>
        {isEdit ? "EDIT" : "BOOK"} SHIFT
      </Typography>
      <DialogContent className={styles.fields}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={formFields.startDate}
              onChange={(newDate) => {
                setFormFields(prevState => ({...prevState, startDate: newDate}));
              }}
              renderInput={(params) => <TextField color="secondary" {...params} />}
            />
            <DatePicker
              label="End Date"
              value={formFields.endDate}
              onChange={(newDate) => {
                setFormFields(prevState => ({...prevState, endDate: newDate}));
              }}
              renderInput={(params) => <TextField color="secondary" {...params} />}
            />
          </Stack>
        </LocalizationProvider>
        <Select
          value={formFields.taxiId}
          onChange={(event) => updateFormField(event, 'taxiId')}
          displayEmpty
          color="secondary"
        >
          <MenuItem value="" disabled>Select Taxi</MenuItem>
          {TAXI_IDS.map((id) => (
            <MenuItem key={id} value={id}>{id}</MenuItem>
          ))}
        </Select>
        <Select
          value={formFields.shift}
          onChange={(event) => updateFormField(event, 'shift')}
          displayEmpty
          color="secondary"
        >
          <MenuItem value="" disabled>Select Shift</MenuItem>
          <MenuItem value="morning">Morning Shift</MenuItem>
          <MenuItem value="night">Night Shift</MenuItem>
        </Select>
        <Select
          value={formFields.driverType}
          onChange={(event) => updateFormField(event, 'driverType')}
          displayEmpty
          color="secondary"
        >
          <MenuItem value="" disabled>Select Driver Type</MenuItem>
          <MenuItem value="permanent">Permanent Driver</MenuItem>
          <MenuItem value="temporary">Temporary Driver</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            Submitting...
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabled()}>
            Submit
          </Button>}
      </DialogActions>
    </Dialog>
  )
}
