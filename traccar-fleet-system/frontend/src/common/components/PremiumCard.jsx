import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  backgroundColor: '#FFFFFF',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    transform: 'translateY(-1px)',
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: '24px 24px 16px 24px',
  '& .MuiCardHeader-title': {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1E293B',
    letterSpacing: '0.025em',
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.875rem',
    color: '#64748B',
    fontWeight: 400,
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px 24px 24px 24px',
  '&:last-child': {
    paddingBottom: '24px',
  },
}));

const PremiumCard = ({ 
  title, 
  subtitle, 
  children, 
  headerAction,
  hover = true,
  ...props 
}) => {
  const CardComponent = hover ? StyledCard : Card;

  return (
    <CardComponent {...props}>
      {(title || subtitle || headerAction) && (
        <StyledCardHeader
          title={title}
          subheader={subtitle}
          action={headerAction}
        />
      )}
      <StyledCardContent>
        {children}
      </StyledCardContent>
    </CardComponent>
  );
};

export default PremiumCard;



