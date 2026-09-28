import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import PropTypes from 'prop-types';

const MetricCard = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  trendDirection = 'up',
  subtitle,
  loading = false,
  sx = {}
}) => {
  const theme = useTheme();

  const getColor = () => {
    const colors = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    };
    return colors[color] || theme.palette.primary.main;
  };

  const cardColor = getColor();

  const renderTrend = () => {
    if (!trend) return null;

    const isPositive = trendDirection === 'up';
    const trendColor = isPositive ? theme.palette.success.main : theme.palette.error.main;
    const trendSymbol = isPositive ? '↑' : '↓';

    return (
      <Typography
        variant="caption"
        sx={{
          color: trendColor,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          ml: 0.5
        }}
      >
        {trendSymbol} {trend}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', ...sx }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                bgcolor: 'grey.300',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          </Box>
          <Box
            sx={{
              height: 32,
              width: '70%',
              bgcolor: 'grey.300',
              borderRadius: 0.5,
              mb: 1
            }}
          />
          <Box
            sx={{
              height: 20,
              width: '40%',
              bgcolor: 'grey.200',
              borderRadius: 0.5
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.1)} 0%, ${alpha(cardColor, 0.05)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(cardColor, 0.15)}`,
          border: `1px solid ${alpha(cardColor, 0.3)}`,
        },
        ...sx
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: cardColor
                }}
              >
                {value}
              </Typography>
              {renderTrend()}
            </Box>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 2,
                backgroundColor: alpha(cardColor, 0.15),
                color: cardColor
              }}
            >
              {React.cloneElement(icon, { fontSize: 'large' })}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.element,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down']),
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  sx: PropTypes.object
};

export default MetricCard;