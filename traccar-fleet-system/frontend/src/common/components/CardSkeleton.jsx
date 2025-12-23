import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  card: {
    margin: theme.spacing(1),
    borderRadius: theme.spacing(1),
  },
  content: {
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  avatar: {
    marginRight: theme.spacing(1.5),
  },
  title: {
    flex: 1,
  },
  body: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const CardSkeleton = ({ 
  showAvatar = true, 
  showFooter = true, 
  lines = 3,
  height = 200 
}) => {
  const { classes } = useStyles();

  return (
    <Card className={classes.card} sx={{ height }}>
      <CardContent className={classes.content}>
        <Box className={classes.header}>
          {showAvatar && (
            <Skeleton 
              variant="circular" 
              width={40} 
              height={40} 
              className={classes.avatar}
            />
          )}
          <Box className={classes.title}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>
        
        <Box className={classes.body}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index}
              variant="text" 
              width={`${100 - index * 10}%`} 
              height={20}
              sx={{ marginBottom: 1 }}
            />
          ))}
        </Box>
        
        {showFooter && (
          <Box className={classes.footer}>
            <Skeleton variant="text" width="30%" height={20} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;