import { IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {format} from 'date-fns';
import styles from '../styles/shiftRow.module.scss';

export default function ShiftRow(props) {
    const shift = props.shift;
    return (
        <div>
            <Stack direction="row" justifyContent="space-between" sx={{ margin: "1em 0" }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Stack direction="column" sx={{ flexGrow: 1 }}>
                        <Typography variant="h3">
                            {format(shift.date, 'MM/dd/yy')}
                        </Typography> 
                        <Typography variant="h4">
                            {shift.taxiId}
                        </Typography>
                    </Stack>
                    <Stack direction="column" sx={{ flexGrow: 1 }}>
                        <Typography variant="h5">
                            {shift.shift} Shift
                        </Typography>
                        <Typography variant="h5">
                            {shift.driverType} Driver
                        </Typography>                
                    </Stack>
                </Stack>
                <Stack direction="row" className={styles.actions}>
                    <IconButton aria-label="edit" color="secondary" onClick={props.onEdit}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" color="secondary" onClick={props.onDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            </Stack>
        </div>
    )
}
