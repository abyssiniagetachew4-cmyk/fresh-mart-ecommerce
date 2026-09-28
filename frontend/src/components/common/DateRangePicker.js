import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  TextField,
  Typography,
  IconButton,
  Stack,
  useTheme
} from '@mui/material';
import {
  DateRange,
  CalendarToday,
  Clear,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PropTypes from 'prop-types';
import { format, subDays, isWithinInterval } from 'date-fns';

const DateRangePicker = ({
  value = { startDate: subDays(new Date(), 30), endDate: new Date() },
  onChange,
  presets = [
    { label: 'Today', getValue: () => ({ startDate: new Date(), endDate: new Date() }) },
    { label: 'Yesterday', getValue: () => ({ startDate: subDays(new Date(), 1), endDate: subDays(new Date(), 1) }) },
    { label: 'Last 7 days', getValue: () => ({ startDate: subDays(new Date(), 7), endDate: new Date() }) },
    { label: 'Last 30 days', getValue: () => ({ startDate: subDays(new Date(), 30), endDate: new Date() }) },
    { label: 'This month', getValue: () => ({ 
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    }) },
    { label: 'Last month', getValue: () => ({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    }) },
  ],
  minDate,
  maxDate,
  disabled = false,
  sx = {}
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempRange, setTempRange] = useState(value);
  const [view, setView] = useState('presets'); // 'presets' or 'custom'

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setTempRange(value);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setView('presets');
  };

  const handleApply = () => {
    onChange(tempRange);
    handleClose();
  };

  const handleClear = () => {
    const newRange = { startDate: subDays(new Date(), 30), endDate: new Date() };
    setTempRange(newRange);
    onChange(newRange);
    handleClose();
  };

  const handlePresetClick = (preset) => {
    const newRange = preset.getValue();
    setTempRange(newRange);
    onChange(newRange);
    handleClose();
  };

  const formatDateRange = (range) => {
    if (!range.startDate || !range.endDate) return 'Select Date Range';
    
    const startStr = format(range.startDate, 'MMM dd, yyyy');
    const endStr = format(range.endDate, 'MMM dd, yyyy');
    
    if (format(range.startDate, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd')) {
      return startStr;
    }
    
    return `${startStr} - ${endStr}`;
  };

  const isWithinRange = (date, range) => {
    if (!range.startDate || !range.endDate) return false;
    return isWithinInterval(date, { start: range.startDate, end: range.endDate });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={sx}>
        <Button
          variant="outlined"
          startIcon={<DateRange />}
          onClick={handleClick}
          disabled={disabled}
          sx={{
            justifyContent: 'space-between',
            minWidth: 250,
            textTransform: 'none',
            borderColor: open ? theme.palette.primary.main : undefined,
            '&:hover': {
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          <Typography noWrap sx={{ flexGrow: 1, textAlign: 'left' }}>
            {formatDateRange(value)}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            sx={{ ml: 1 }}
          >
            <Clear fontSize="small" />
          </IconButton>
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              p: 3,
              width: 600,
              maxWidth: '90vw',
              borderRadius: 2,
              boxShadow: theme.shadows[8]
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Select Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {view === 'custom' && (
                  <Button
                    size="small"
                    startIcon={<ChevronLeft />}
                    onClick={() => setView('presets')}
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Box>
            </Box>

            {/* Content based on view */}
            {view === 'presets' ? (
              <>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Quick Presets
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => handlePresetClick(preset)}
                      sx={{
                        flex: '1 0 calc(50% - 8px)',
                        minWidth: 120,
                        justifyContent: 'flex-start',
                        textTransform: 'none'
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Stack>
                <Button
                  variant="text"
                  startIcon={<CalendarToday />}
                  onClick={() => setView('custom')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Custom Date Range
                </Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Select Start and End Dates
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <DatePicker
                      label="Start Date"
                      value={tempRange.startDate}
                      onChange={(newDate) => setTempRange(prev => ({ ...prev, startDate: newDate }))}
                      maxDate={tempRange.endDate || maxDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small"
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <DatePicker
                      label="End Date"
                      value={tempRange.endDate}
                      onChange={(newDate) => setTempRange(prev => ({ ...prev, endDate: newDate }))}
                      minDate={tempRange.startDate || minDate}
                      maxDate={maxDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small"
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Selected Range Preview */}
                {tempRange.startDate && tempRange.endDate && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Selected Range:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDateRange(tempRange)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Footer Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleApply}
                disabled={!tempRange.startDate || !tempRange.endDate}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

DateRangePicker.propTypes = {
  value: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }),
  onChange: PropTypes.func.isRequired,
  presets: PropTypes.array,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  disabled: PropTypes.bool,
  sx: PropTypes.object
};

export default DateRangePicker;