import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { useState } from 'react';

interface SchemaColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface SchemaTableProps {
  columns: SchemaColumn[];
  title: string;
}

export default function SchemaTable({ columns, title }: SchemaTableProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleNoteChange = (columnName: string, note: string) => {
    setNotes((prev) => ({ ...prev, [columnName]: note }));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {columns.length} columns
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '30%' }}>Column Name</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '15%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '55%' }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.map((column) => (
              <TableRow key={column.column_name} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {column.column_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={column.data_type}
                    size="small"
                    sx={{
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add reference note..."
                    value={notes[column.column_name] || ''}
                    onChange={(e) => handleNoteChange(column.column_name, e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
