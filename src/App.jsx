import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

const ROWS_PER_VIEW = 5;
const ROTATE_INTERVAL = 5000;
const TOTAL_UNITS = 6;

const colWidths = {
  no: (0.3 / TOTAL_UNITS) * 100,
  kegiatan: (1 / TOTAL_UNITS) * 100,
  tanggal: (0.7 / TOTAL_UNITS) * 100,
  jam: (0.4 / TOTAL_UNITS) * 100,
  tempat: (1 / TOTAL_UNITS) * 100,
  keterangan: (1 / TOTAL_UNITS) * 100,
};

// Font-size responsif: min 16px, ideal 4vw, max 64px
const responsiveFontSize = 'clamp(16px, 1.75vw, 64px)';

const cellStyle = (width, isLast = false, content = '') => ({
  width: `${width}%`,  
  lineHeight: 1.3,
  px: '1vw',
  py: 'calc(1vw * 1.3)',
  wordWrap: 'break-word',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  borderRight: isLast ? 'none' : '1px solid rgba(0, 0, 0, 1)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
  // Dinamis mengecil berdasarkan panjang konten
  minWidth: 0,
  maxWidth: `${width}%`,
  overflow: 'hidden',
  textOverflow: 'clip',
  fontSize: `calc(${responsiveFontSize} * clamp(0.5, ${40 / Math.max(content.length, 1)}, 1))`,
});

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(0);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vR8l9TxcFuC8dTicblDiOBZdbN7e7BOMimn0xTzZSFHsQHUfMQiQLZYsXQT0l_Xijqgeg6nP396oEG1/pub?output=tsv')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return setData([]);
        const headers = lines[0].split('\t');
        const rows = lines.slice(1).map((line, i) => {
          const values = line.split('\t');
          const getVal = col => {
            const idx = headers.findIndex(h => h.trim() === col);
            return idx !== -1 ? values[idx] || '' : '';
          };
          return {
            no: i + 1,
            kegiatan: getVal('KEGIATAN'),
            tanggal: getVal('TANGGAL'),
            jam: getVal('JAM'),
            tempat: getVal('TEMPAT'),
            keterangan: getVal('KETERANGAN'),
          };
        });
        setData(rows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let rotateInterval;
    if (data.length > ROWS_PER_VIEW) {
      rotateInterval = setInterval(() => {
        setCurrentGroup(prev => (prev + 1) % Math.ceil(data.length / ROWS_PER_VIEW));
      }, ROTATE_INTERVAL);
    }
    return () => clearInterval(rotateInterval);
  }, [data.length]);

  const visibleRows = data.slice(
    currentGroup * ROWS_PER_VIEW,
    (currentGroup + 1) * ROWS_PER_VIEW
  );

  return (
      <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,      
      width: '100vw',
      height: '100vh',
      p: '2vh',
      boxSizing: 'border-box',
      overflow: 'hidden',
        backgroundSize: 'cover',
     backgroundImage: 'url("/backgroundImage.jpg")',      
    }}
  >
    <Typography
      variant="h1"
      sx={{
        fontSize: `calc(${responsiveFontSize} * 2)`,        
        fontWeight: 'bold',
        mb: '1vh',
        textAlign: 'center',
        color: '#000', // pastikan kontras dengan background
        textShadow: '1px 4px 4px rgba(255,255,255,0.6)', // opsional: tambah bayangan teks
marginBottom: '30px',
      }}
    >
    JADWAL KEGIATAN KEJAKSAAN NEGERI PATI
    </Typography>

    <TableContainer
      component={Paper}
      sx={{
        tableLayout: 'fixed',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // semi-transparan agar blend dengan bg
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        borderRadius: '20px',
      }}
    >
        <Table>
          <TableHead>
            <TableRow
            sx={{ textAlign: 'center', bgcolor: 'grey.400' }}>
              <TableCell sx={cellStyle(colWidths.no)}>NO</TableCell>
              <TableCell sx={cellStyle(colWidths.kegiatan)}>Kegiatan</TableCell>
              <TableCell sx={cellStyle(colWidths.tanggal)}>Tanggal</TableCell>
              <TableCell sx={cellStyle(colWidths.jam)}>Jam</TableCell>
              <TableCell sx={cellStyle(colWidths.tempat)}>Tempat</TableCell>
              <TableCell sx={cellStyle(colWidths.keterangan, true)}>Keterangan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: '3vh' }}>
                  <CircularProgress size="5vw" />
                </TableCell>
              </TableRow>
            ) : visibleRows.length > 0 ? (
              visibleRows.map(row => (
                <TableRow key={`${currentGroup}-${row.no}`}>
                  <TableCell sx={cellStyle(colWidths.no)}>{row.no}</TableCell>
                  <TableCell sx={cellStyle(colWidths.kegiatan, false, row.kegiatan)}>{row.kegiatan}</TableCell>
                  <TableCell sx={cellStyle(colWidths.tanggal, false, row.tanggal)}>{row.tanggal}</TableCell>
                  <TableCell sx={cellStyle(colWidths.jam, false, row.jam)}>{row.jam}</TableCell>
                  <TableCell sx={cellStyle(colWidths.tempat, false, row.tempat)}>{row.tempat}</TableCell>
                  <TableCell sx={cellStyle(colWidths.keterangan, true, row.keterangan)}>{row.keterangan}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: '2vh' }}>
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      
    </Box>
  );
}

