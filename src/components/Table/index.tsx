import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import useIsMobileDevice from '../../hooks/useIsMobileDevice';
import { ProcessedRelayInfo } from '../../utils/types';
import { StyledPaper, StyledTableCell, StyledTableRow } from './styles';

interface StyledTableProps {
  data: ProcessedRelayInfo[];
  hasCalledBootstrap: boolean;
}

/**
 * Styled Material UI table component to render chain relay data
 * @param {StyledTableProps} data to be rendered in table and boolean property to know if loading indicator should be rendered
 * @returns {JSX.Element} styled table component with rendered data
 */
export default function StyledTable({ data, hasCalledBootstrap }: StyledTableProps): JSX.Element {
  // We call useIsMobileDevice hook to get a variable to help with table stylization depending on screen size
  const isMobileDevice = useIsMobileDevice();

  // If bootstrap function was not called in parent component, we render a loading indicator
  if (!hasCalledBootstrap) {
    return <CircularProgress />;
  }

  // If no entries exist in data array, we render an informative message
  if (data.length === 0) {
    return <div>No relay information for the latest blocks</div>;
  }

  return (
    <TableContainer sx={{ maxHeight: 440 }} component={StyledPaper}>
      <Table stickyHeader sx={isMobileDevice ? {} : { minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="center">Chain</StyledTableCell>
            <StyledTableCell align="center">Relay Number</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .sort((a, b) => b.relayNum - a.relayNum)
            .map((entry) => (
              <StyledTableRow hover key={entry.specId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <StyledTableCell align="center" component="th" scope="row">
                  {entry.specId}
                </StyledTableCell>
                <StyledTableCell align="center">{entry.relayNum}</StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
