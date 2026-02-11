"use client";

import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, FormControl, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface DateRange {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}

interface HeaderProps {
  title?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange) => void;
}

const MONTHS = [
  { value: 1, label: 'Ene' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dic' },
];

const YEARS = [2024, 2025, 2026];

export default function Header({ title = "Nesforce Dashboard", dateRange, onDateRangeChange }: HeaderProps) {
  const handleFromMonthChange = (event: SelectChangeEvent<number>) => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange({ ...dateRange, fromMonth: event.target.value as number });
    }
  };

  const handleFromYearChange = (event: SelectChangeEvent<number>) => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange({ ...dateRange, fromYear: event.target.value as number });
    }
  };

  const handleToMonthChange = (event: SelectChangeEvent<number>) => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange({ ...dateRange, toMonth: event.target.value as number });
    }
  };

  const handleToYearChange = (event: SelectChangeEvent<number>) => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange({ ...dateRange, toYear: event.target.value as number });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        color: "#1A1A1A",
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <Toolbar sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 0 }, py: { xs: 1, sm: 0 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: { xs: 1, md: 0 },
            fontWeight: 600,
            color: "primary.main",
            fontSize: { xs: '1rem', sm: '1.25rem' },
            mr: { md: 3 },
          }}
        >
          {title}
        </Typography>

        {/* Date Range Selector */}
        {dateRange && onDateRangeChange && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1 },
              flexGrow: 1,
              justifyContent: { xs: 'flex-start', md: 'flex-start' },
              order: { xs: 3, md: 2 },
              width: { xs: '100%', md: 'auto' },
              mt: { xs: 1, md: 0 },
            }}
          >
            <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: { xs: 16, sm: 20 }, display: { xs: 'none', sm: 'block' } }} />

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, display: { xs: 'none', sm: 'block' } }}>
              Desde:
            </Typography>

            <FormControl size="small" sx={{ minWidth: { xs: 55, sm: 70 } }}>
              <Select
                value={dateRange.fromMonth}
                onChange={handleFromMonthChange}
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  '& .MuiSelect-select': { py: { xs: 0.5, sm: 0.75 }, px: { xs: 1, sm: 1.5 } }
                }}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 75 } }}>
              <Select
                value={dateRange.fromYear}
                onChange={handleFromYearChange}
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  '& .MuiSelect-select': { py: { xs: 0.5, sm: 0.75 }, px: { xs: 1, sm: 1.5 } }
                }}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y} sx={{ fontSize: '0.8rem' }}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mx: { xs: 0.25, sm: 0.5 }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              -
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, display: { xs: 'none', sm: 'block' } }}>
              Hasta:
            </Typography>

            <FormControl size="small" sx={{ minWidth: { xs: 55, sm: 70 } }}>
              <Select
                value={dateRange.toMonth}
                onChange={handleToMonthChange}
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  '& .MuiSelect-select': { py: { xs: 0.5, sm: 0.75 }, px: { xs: 1, sm: 1.5 } }
                }}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 75 } }}>
              <Select
                value={dateRange.toYear}
                onChange={handleToYearChange}
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  '& .MuiSelect-select': { py: { xs: 0.5, sm: 0.75 }, px: { xs: 1, sm: 1.5 } }
                }}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y} sx={{ fontSize: '0.8rem' }}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, order: { xs: 2, md: 3 } }}>
          <IconButton color="inherit" sx={{ color: "text.secondary" }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>N</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export type { DateRange };
