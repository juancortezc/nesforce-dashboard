"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import StarsIcon from "@mui/icons-material/Stars";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

interface MenuGroup {
  id: string;
  title: string;
  fullTitle: string;
  icon: React.ReactNode;
  tabIndex?: number;
  children?: { title: string; tabIndex: number }[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "puntos",
    title: "Puntos",
    fullTitle: "Puntos",
    icon: <StarsIcon fontSize="small" />,
    tabIndex: 0,
  },
  {
    id: "transacciones",
    title: "Trans.",
    fullTitle: "Transacciones",
    icon: <ReceiptIcon fontSize="small" />,
    tabIndex: 1,
  },
  {
    id: "analisis",
    title: "Análisis",
    fullTitle: "Análisis",
    icon: <BarChartIcon fontSize="small" />,
    tabIndex: 2,
  },
  {
    id: "solicitudes",
    title: "Solic.",
    fullTitle: "Solicitudes",
    icon: <AssignmentIcon fontSize="small" />,
    tabIndex: 3,
  },
  {
    id: "comparativos",
    title: "Compar.",
    fullTitle: "Comparativos",
    icon: <CompareArrowsIcon fontSize="small" />,
    tabIndex: 4,
  },
  {
    id: "logistica",
    title: "Logíst.",
    fullTitle: "Logística",
    icon: <LocalShippingIcon fontSize="small" />,
    tabIndex: 5,
  },
];

const BOTTOM_NAV_HEIGHT = 64;

interface BottomNavProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleClick = (event: React.MouseEvent<HTMLElement>, groupId: string, tabIndex?: number) => {
    if (tabIndex !== undefined) {
      onTabChange(tabIndex);
    } else {
      setAnchorEl((prev) => ({ ...prev, [groupId]: event.currentTarget }));
    }
  };

  const handleClose = (groupId: string) => {
    setAnchorEl((prev) => ({ ...prev, [groupId]: null }));
  };

  const handleMenuItemClick = (tabIndex: number, groupId: string) => {
    onTabChange(tabIndex);
    handleClose(groupId);
  };

  const isGroupActive = (group: MenuGroup) => {
    if (group.tabIndex !== undefined) return activeTab === group.tabIndex;
    return group.children?.some((child) => activeTab === child.tabIndex) || false;
  };

  const isMenuOpen = (groupId: string) => Boolean(anchorEl[groupId]);

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the bottom nav */}
      <Box sx={{ height: { xs: BOTTOM_NAV_HEIGHT, md: 56 } }} />

      <Paper
        elevation={isDesktop ? 0 : 8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: { xs: BOTTOM_NAV_HEIGHT, md: 56 },
          zIndex: 1200,
          borderRadius: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: isDesktop ? "#1a237e" : "background.paper",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: isDesktop ? "center" : "space-around",
            alignItems: "center",
            height: "100%",
            px: { xs: 0.5, sm: 2, md: 4 },
            maxWidth: isDesktop ? 900 : "100%",
            mx: "auto",
            gap: isDesktop ? 1 : 0,
          }}
        >
          {menuGroups.map((group) => {
            const isActive = isGroupActive(group);
            const isOpen = isMenuOpen(group.id);

            return (
              <Box key={group.id} sx={{ flex: isDesktop ? "none" : 1, display: "flex", justifyContent: "center" }}>
                {group.tabIndex !== undefined ? (
                  <Box
                    onClick={(e) => handleClick(e, group.id, group.tabIndex)}
                    sx={{
                      display: "flex",
                      flexDirection: isDesktop ? "row" : "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: isDesktop ? 1 : 0.3,
                      py: isDesktop ? 1 : 1,
                      px: { xs: 1, sm: 2, md: 2.5 },
                      color: isDesktop
                        ? (isActive ? "white" : "rgba(255,255,255,0.7)")
                        : (isActive ? "primary.main" : "text.secondary"),
                      cursor: "pointer",
                      borderRadius: isDesktop ? 2 : 1,
                      minWidth: { xs: 56, sm: 80, md: "auto" },
                      bgcolor: isDesktop && isActive ? "rgba(255,255,255,0.15)" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: isDesktop ? "rgba(255,255,255,0.1)" : "action.hover",
                      },
                      "&:active": {
                        transform: "scale(0.97)",
                      },
                    }}
                  >
                    {!isDesktop && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: isActive ? "primary.light" : "transparent",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {group.icon}
                      </Box>
                    )}
                    {isDesktop && group.icon}
                    <Typography
                      variant={isDesktop ? "body2" : "caption"}
                      sx={{
                        fontSize: isDesktop ? "0.875rem" : { xs: "0.65rem", sm: "0.75rem" },
                        fontWeight: isActive ? 600 : isDesktop ? 500 : 400,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isDesktop ? group.fullTitle : (isMobile ? group.title.slice(0, 6) : group.title)}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      onClick={(e) => handleClick(e, group.id)}
                      sx={{
                        display: "flex",
                        flexDirection: isDesktop ? "row" : "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: isDesktop ? 1 : 0.3,
                        py: isDesktop ? 1 : 1,
                        px: { xs: 1, sm: 2, md: 2.5 },
                        color: isDesktop
                          ? (isActive || isOpen ? "white" : "rgba(255,255,255,0.7)")
                          : (isActive || isOpen ? "primary.main" : "text.secondary"),
                        cursor: "pointer",
                        borderRadius: isDesktop ? 2 : 1,
                        minWidth: { xs: 56, sm: 80, md: "auto" },
                        bgcolor: isDesktop && (isActive || isOpen) ? "rgba(255,255,255,0.15)" : "transparent",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: isDesktop ? "rgba(255,255,255,0.1)" : "action.hover",
                        },
                        "&:active": {
                          transform: "scale(0.97)",
                        },
                      }}
                    >
                      {!isDesktop && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: isActive || isOpen ? "primary.light" : "transparent",
                            transition: "background-color 0.2s",
                          }}
                        >
                          {group.icon}
                        </Box>
                      )}
                      {isDesktop && group.icon}
                      <Typography
                        variant={isDesktop ? "body2" : "caption"}
                        sx={{
                          fontSize: isDesktop ? "0.875rem" : { xs: "0.65rem", sm: "0.75rem" },
                          fontWeight: isActive ? 600 : isDesktop ? 500 : 400,
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isDesktop ? group.fullTitle : (isMobile ? group.title.slice(0, 6) : group.title)}
                      </Typography>
                    </Box>
                    <Menu
                      anchorEl={anchorEl[group.id]}
                      open={isOpen}
                      onClose={() => handleClose(group.id)}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            mb: 1,
                            minWidth: { xs: 200, sm: 220 },
                            maxWidth: "90vw",
                            borderRadius: 2,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          },
                        },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                          {group.icon}
                          <Typography variant="subtitle2" fontWeight={600}>
                            {group.fullTitle}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider />
                      {group.children?.map((child) => (
                        <MenuItem
                          key={child.tabIndex}
                          onClick={() => handleMenuItemClick(child.tabIndex, group.id)}
                          selected={activeTab === child.tabIndex}
                          sx={{
                            py: 1.5,
                            minHeight: 48,
                            "&.Mui-selected": {
                              backgroundColor: "primary.light",
                              "& .MuiListItemText-primary": {
                                color: "primary.main",
                                fontWeight: 600,
                              },
                            },
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: "0.9rem",
                            }}
                          />
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </>
  );
}

export { BOTTOM_NAV_HEIGHT };
