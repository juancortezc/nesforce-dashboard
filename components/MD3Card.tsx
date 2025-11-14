import { Card, CardProps, Box } from '@mui/material';
import { ReactNode } from 'react';

interface MD3CardProps extends Omit<CardProps, 'variant'> {
  children: ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined' | 'gradient-primary' | 'gradient-success' | 'gradient-info' | 'glass';
  gradient?: string;
}

export default function MD3Card({ children, variant = 'elevated', gradient, sx, ...props }: MD3CardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          background: '#FFFFFF',
          boxShadow: '0px 3px 6px rgba(103, 80, 164, 0.16), 0px 3px 6px rgba(103, 80, 164, 0.10)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 20px rgba(103, 80, 164, 0.20), 0px 6px 6px rgba(103, 80, 164, 0.14)',
          },
        };
      case 'filled':
        return {
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF7FF 100%)',
          border: '1px solid #E8DEF8',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        };
      case 'outlined':
        return {
          background: 'transparent',
          border: '2px solid #E8DEF8',
          borderRadius: 3,
          boxShadow: 'none',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#6750A4',
            boxShadow: '0px 3px 6px rgba(103, 80, 164, 0.12)',
          },
        };
      case 'gradient-primary':
        return {
          background: 'linear-gradient(135deg, #6750A4 0%, #7E6DB3 50%, #9A8FC8 100%)',
          color: '#FFFFFF',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiTypography-root': {
            color: '#FFFFFF',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 20px rgba(103, 80, 164, 0.30)',
          },
        };
      case 'gradient-success':
        return {
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: '#FFFFFF',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiTypography-root': {
            color: '#FFFFFF',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 20px rgba(46, 125, 50, 0.30)',
          },
        };
      case 'gradient-info':
        return {
          background: 'linear-gradient(135deg, #0288D1 0%, #03A9F4 100%)',
          color: '#FFFFFF',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiTypography-root': {
            color: '#FFFFFF',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 20px rgba(2, 136, 209, 0.30)',
          },
        };
      case 'glass':
        return {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 247, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(103, 80, 164, 0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 20px rgba(103, 80, 164, 0.15)',
          },
        };
      default:
        return {};
    }
  };

  return (
    <Card
      {...props}
      sx={{
        ...getCardStyles(),
        ...(gradient && { background: gradient }),
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}
