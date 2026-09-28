import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  InfoOutlined
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ReportCard = ({
  title,
  subtitle,
  icon,
  value,
  trend,
  trendDirection = 'up', // 'up' or 'down'
  color = 'primary',
  children,
  actions,
  action,
  loading = false,
  infoTooltip,
  variant = 'elevation', // 'elevation' or 'outlined'
  elevation = 1,
  sx = {}
}) => {
  const theme = useTheme();

  const getColorPalette = () => {
    const colors = {
      primary: {
        light: theme.palette.primary.light,
        main: theme.palette.primary.main,
        dark: theme.palette.primary.dark,
      },
      secondary: {
        light: theme.palette.secondary.light,
        main: theme.palette.secondary.main,
        dark: theme.palette.secondary.dark,
      },
      success: {
        light: theme.palette.success.light,
        main: theme.palette.success.main,
        dark: theme.palette.success.dark,
      },
      warning: {
        light: theme.palette.warning.light,
        main: theme.palette.warning.main,
        dark: theme.palette.warning.dark,
      },
      error: {
        light: theme.palette.error.light,
        main: theme.palette.error.main,
        dark: theme.palette.error.dark,
      },
      info: {
        light: theme.palette.info.light,
        main: theme.palette.info.main,
        dark: theme.palette.info.dark,
      },
    };
    return colors[color] || colors.primary;
  };

  const palette = getColorPalette();

  const renderTrend = () => {
    if (!trend) return null;

    const isPositive = trendDirection === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const trendColor = isPositive ? theme.palette.success.main : theme.palette.error.main;

    return (
      <Chip
        icon={<TrendIcon sx={{ fontSize: 16 }} />}
        label={trend}
        size="small"
        sx={{
          backgroundColor: alpha(trendColor, 0.1),
          color: trendColor,
          fontWeight: 600,
          ml: 1
        }}
      />
    );
  };

  const renderHeaderAction = () => {
    if (action) {
      return action;
    }

    if (infoTooltip) {
      return (
        <Tooltip title={infoTooltip}>
          <IconButton size="small">
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Card 
        variant={variant} 
        elevation={variant === 'elevation' ? elevation : 0}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...sx 
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 1,
                bgcolor: 'grey.300',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Box 
                sx={{ 
                  height: 24, 
                  width: '60%', 
                  bgcolor: 'grey.300',
                  borderRadius: 0.5,
                  mb: 1
                }}
              />
              <Box 
                sx={{ 
                  height: 16, 
                  width: '40%', 
                  bgcolor: 'grey.200',
                  borderRadius: 0.5
                }}
              />
            </Box>
          </Box>
          <Box 
            sx={{ 
              height: 32, 
              width: '80%', 
              bgcolor: 'grey.300',
              borderRadius: 0.5,
              mb: 2
            }}
          />
          <Box 
            sx={{ 
              height: 100, 
              width: '100%', 
              bgcolor: 'grey.200',
              borderRadius: 1
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant={variant} 
      elevation={variant === 'elevation' ? elevation : 0}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: variant === 'outlined' ? `1px solid ${theme.palette.divider}` : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)'
        },
        ...sx 
      }}
    >
      {/* Card Header */}
      {(title || icon) && (
        <>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {icon && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: alpha(palette.main, 0.1),
                      color: palette.main,
                      mr: 2
                    }}
                  >
                    {React.cloneElement(icon, { fontSize: 'small' })}
                  </Box>
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {renderTrend()}
              </Box>
            }
            action={renderHeaderAction()}
            sx={{
              pb: 1,
              '& .MuiCardHeader-action': {
                alignSelf: 'center',
                margin: 0
              }
            }}
          />
          <Divider />
        </>
      )}

      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        {value && (
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: palette.main,
              mb: 2
            }}
          >
            {value}
          </Typography>
        )}
        
        {children && (
          <Box sx={{ mt: value ? 0 : 2 }}>
            {children}
          </Box>
        )}
      </CardContent>

      {/* Card Actions */}
      {actions && (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            {actions}
          </CardActions>
        </>
      )}
    </Card>
  );
};

ReportCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.element,
  value: PropTypes.node,
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
  children: PropTypes.node,
  actions: PropTypes.node,
  action: PropTypes.node,
  loading: PropTypes.bool,
  infoTooltip: PropTypes.string,
  variant: PropTypes.oneOf(['elevation', 'outlined']),
  elevation: PropTypes.number,
  sx: PropTypes.object
};

export default ReportCard;