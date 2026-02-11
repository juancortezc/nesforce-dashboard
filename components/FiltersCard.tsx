"use client";

import { Box, Card, CardContent, Typography, useTheme, useMediaQuery } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

interface FiltersCardProps {
  children: React.ReactNode;
  title?: string;
}

export function FiltersCard({ children, title = "Filtros" }: FiltersCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      elevation={0}
      sx={{
        mb: { xs: 2, sm: 3 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 1.5, sm: 2 },
      }}
    >
      <CardContent
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          gap={{ xs: 1, sm: 2 }}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <FilterListIcon sx={{ color: "text.secondary", fontSize: { xs: 18, sm: 20 } }} />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              {title}
            </Typography>
          </Box>
          <Box
            display="flex"
            gap={{ xs: 1, sm: 1.5 }}
            flexWrap="wrap"
            alignItems="center"
            sx={{
              "& > *": {
                flex: isMobile ? "1 1 auto" : "0 0 auto",
                minWidth: isMobile ? "calc(50% - 4px)" : "auto",
              },
              "& .MuiAutocomplete-root": {
                flex: isMobile ? "1 1 100%" : "0 0 auto",
                minWidth: isMobile ? "100%" : 200,
              },
              "& .MuiFormControl-root": {
                minWidth: isMobile ? "calc(50% - 4px)" : 150,
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
