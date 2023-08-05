import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material';

export const StyledPaper = styled(Paper)(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: 0,
  color: theme.palette.common.white,
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export const StyledTableRow = styled(TableRow)(() => ({
  '&:hover': {
    cursor: 'pointer',
  },
}));
