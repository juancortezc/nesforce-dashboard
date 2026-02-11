"use client";

import { Box, Typography, Chip, useTheme, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  chipLabel?: string;
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function PageHeader({
  title,
  icon,
  chipLabel,
  currentIndex = 0,
  totalPages = 5,
  onPrevious,
  onNext,
}: PageHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalPages - 1;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
      gap={1}
    >
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" minWidth={0} flex={1}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight="bold"
          color="text.primary"
          sx={{
            fontSize: { xs: "0.95rem", sm: "1.25rem", md: "1.5rem" },
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: { xs: "nowrap", sm: "normal" },
            maxWidth: { xs: "100%", sm: "none" },
          }}
        >
          {title}
        </Typography>
        {!isMobile && chipLabel && icon && (
          <Chip
            icon={icon as React.ReactElement}
            label={chipLabel}
            color="primary"
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Navigation arrows */}
      {(onPrevious || onNext) && (
        <Box display="flex" alignItems="center" gap={0} flexShrink={0}>
          <Tooltip title="Anterior" arrow>
            <span>
              <IconButton
                onClick={onPrevious}
                disabled={!hasPrev}
                size={isMobile ? "medium" : "small"}
                sx={{
                  color: hasPrev ? "text.secondary" : "action.disabled",
                  "&:hover": { backgroundColor: "action.hover" },
                  minWidth: { xs: 44, sm: "auto" },
                  minHeight: { xs: 44, sm: "auto" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Siguiente" arrow>
            <span>
              <IconButton
                onClick={onNext}
                disabled={!hasNext}
                size={isMobile ? "medium" : "small"}
                sx={{
                  color: hasNext ? "text.secondary" : "action.disabled",
                  "&:hover": { backgroundColor: "action.hover" },
                  minWidth: { xs: 44, sm: "auto" },
                  minHeight: { xs: 44, sm: "auto" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
