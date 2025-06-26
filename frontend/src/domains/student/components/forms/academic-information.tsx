import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useFormContext } from 'react-hook-form';
import { School } from '@mui/icons-material';
import { parseISO } from 'date-fns';

import { DATE_FORMAT } from '@/utils/helpers/date';
import { StudentProps } from '../../types';
import { useClasses } from '../../hooks';
import { useGetSectionsQuery } from '@/domains/section/api';

// Fallback data to ensure dropdowns are never empty
const fallbackClasses = [
  { id: 1, name: 'Class 1' },
  { id: 2, name: 'Class 2' },
  { id: 3, name: 'Class 3' },
  { id: 4, name: 'Class 4' },
  { id: 5, name: 'Class 5' },
  { id: 6, name: 'Class 6' },
  { id: 7, name: 'Class 7' },
  { id: 8, name: 'Class 8' },
  { id: 9, name: 'Class 9' },
  { id: 10, name: 'Class 10' }
];

const fallbackSections = [
  { id: 1, name: 'Section A' },
  { id: 2, name: 'Section B' },
  { id: 3, name: 'Section C' },
  { id: 4, name: 'Section D' }
];

export const AcademicInformation = () => {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<StudentProps>();

  const classesFromHook = useClasses();
  const { data: sectionsData, isLoading: sectionsLoading } = useGetSectionsQuery();

  // Use API data if available, otherwise use fallback data
  const availableClasses = classesFromHook && classesFromHook.length > 0 ? classesFromHook : fallbackClasses;
  
  const availableSections = sectionsData?.sections && sectionsData.sections.length > 0 
    ? sectionsData.sections 
    : fallbackSections;

  return (
    <>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <School sx={{ mr: 1 }} />
        <Typography variant='body1'>Academic Information</Typography>
      </Box>
      <Stack sx={{ my: 2 }} spacing={2}>
        <FormControl size='small' sx={{ width: '150px' }} error={Boolean(errors.class)}>
          <InputLabel id='class-label' shrink>
            Class
          </InputLabel>
          <Controller
            name='class'
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <Select
                  label='Class'
                  labelId='class-label'
                  notched
                  value={value || ''}
                  onChange={(event) => onChange(event.target.value)}
                >
                  {availableClasses.map((classItem) => (
                    <MenuItem value={classItem.name} key={classItem.id}>
                      {classItem.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{error?.message}</FormHelperText>
              </>
            )}
          />
        </FormControl>
        
        <FormControl size='small' sx={{ width: '150px' }} error={Boolean(errors.section)}>
          <InputLabel id='section-label' shrink>
            Section
          </InputLabel>
          <Controller
            name='section'
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <Select
                  label='Section'
                  labelId='section-label'
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  notched
                >
                  {sectionsLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : (
                    availableSections.map((section) => (
                      <MenuItem value={section.name} key={section.id}>
                        {section.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>{error?.message}</FormHelperText>
              </>
            )}
          />
        </FormControl>
        
        <Box>
          <TextField
            {...register('roll')}
            error={Boolean(errors.roll)}
            helperText={errors.roll?.message}
            label='Roll'
            size='small'
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
        
        <Box>
          <Controller
            name='admissionDate'
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <DatePicker
                label='Admission Date'
                slotProps={{
                  textField: {
                    helperText: error?.message,
                    size: 'small',
                    InputLabelProps: { shrink: true },
                    error: Boolean(error)
                  }
                }}
                format={DATE_FORMAT}
                value={typeof value === 'string' ? parseISO(value) : value}
                onChange={(value) => onChange(value)}
              />
            )}
          />
        </Box>
      </Stack>
    </>
  );
};