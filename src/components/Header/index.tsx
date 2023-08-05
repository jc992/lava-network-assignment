import Paper from '@mui/material/Paper';

interface HeaderProps {
  currentHeight?: number;
}

/**
 * Styled Material UI paper component to render latest block height synced
 * @param {HeaderProps} current block height to be rendered in paper
 * @returns {JSX.Element} styled paper component with rendered message
 */
export default function Header({ currentHeight }: HeaderProps): JSX.Element {
  return (
    <Paper sx={{ boxShadow: 'none', background: 'transparent', color: 'white', marginBottom: 1 }}>
      Latest synced block height: {currentHeight}
    </Paper>
  );
}
