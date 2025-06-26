import * as React from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { Controller, UseFormReturn } from 'react-hook-form';
import { StudentFilter } from '../../types';
import { useGetClassesQuery } from '@/domains/class/api';

type FilterStudentProps = {
  methods: UseFormReturn<StudentFilter>;
  searchStudent: () => void;
};

export const FilterStudent: React.FC<FilterStudentProps> = ({ methods, searchStudent }) => {
  const { data: classResult, error: classError, isLoading: classLoading } = useGetClassesQuery();

  const [sections, setSections] = React.useState<string[]>([]);
  const { control, register, watch } = methods;

  // Watch the class value to update sections when it changes
  const selectedClassValue = watch('class');

  // Fallback classes if API fails
  const fallbackClasses = [
    { id: 1, name: 'Class 1', sections: 'A,B,C' },
    { id: 2, name: 'Class 2', sections: 'A,B,C,D' },
    { id: 3, name: 'Class 3', sections: 'A,B' },
    { id: 4, name: 'Class 4', sections: 'A,B,C' },
    { id: 5, name: 'Class 5', sections: 'A,B,C,D,E' },
    { id: 6, name: 'Class 6', sections: 'A,B,C' },
    { id: 7, name: 'Class 7', sections: 'A,B,C,D' },
    { id: 8, name: 'Class 8', sections: 'A,B,C' },
    { id: 9, name: 'Class 9', sections: 'A,B,C,D' },
    { id: 10, name: 'Class 10', sections: 'A,B,C' },
    { id: 11, name: 'Class 11', sections: 'Science,Commerce,Arts' },
    { id: 12, name: 'Class 12', sections: 'Science,Commerce,Arts' }
  ];

  // Fallback sections if no class is selected or API fails
  const fallbackSections = ['A', 'B', 'C', 'D', 'E'];

  // Get classes data - use API data if available, otherwise use fallback
  const classesData = React.useMemo(() => {
    if (classError || !classResult?.classes) {
      return fallbackClasses;
    }
    return classResult.classes;
  }, [classResult, classError]);

  // Handle class change and update sections
  const handleClassChange = React.useCallback(
    (selectedClass: number | string) => {
      if (!selectedClass) {
        setSections(fallbackSections);
        return;
      }

      const selectedClassItem = classesData.find((cl) => cl.id === Number(selectedClass));

      if (selectedClassItem && selectedClassItem.sections) {
        // Split sections by comma and trim whitespace
        const sectionsArray = selectedClassItem.sections
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        setSections(sectionsArray.length > 0 ? sectionsArray : fallbackSections);
      } else {
        // If no sections found for the class, use fallback
        setSections(fallbackSections);
      }
    },
    [classesData]
  );

  // Update sections when selectedClassValue changes
  React.useEffect(() => {
    if (selectedClassValue) {
      handleClassChange(selectedClassValue);
    } else {
      setSections(fallbackSections);
    }
  }, [selectedClassValue, handleClassChange]);

  // Initialize sections on component mount
  React.useEffect(() => {
    if (!selectedClassValue) {
      setSections(fallbackSections);
    }
  }, []);

  return (
    <Box component={Paper} sx={{ p: 2 }}>
      <Typography variant='body1' sx={{ mb: 3 }}>
        Filter Criteria
      </Typography>

      {/* Show warning if API failed */}
      {/* {classError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Unable to load classes from server. Using default class list.
        </Alert>
      )} */}

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='student-class-select'>Class</InputLabel>
            <Controller
              name='class'
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  labelId='student-class-select'
                  label='Class'
                  value={value || ''}
                  onChange={(event) => {
                    const selectedClass = event.target.value;
                    onChange(selectedClass);
                    handleClassChange(selectedClass);
                  }}
                  disabled={classLoading}
                >
                  <MenuItem value=''>
                    <em>All Classes</em>
                  </MenuItem>
                  {classesData.map((c) => (
                    <MenuItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size='small'>
            <InputLabel id='student-section-select'>Section</InputLabel>
            <Controller
              name='section'
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  labelId='student-section-select'
                  label='Section'
                  value={value || ''}
                  onChange={onChange}
                  size='small'
                >
                  <MenuItem value=''>
                    <em>All Sections</em>
                  </MenuItem>
                  {sections.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 3 }}>
          <TextField
            {...register('name')}
            label='Name'
            fullWidth
            size='small'
            placeholder='Enter student name'
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 3 }}>
          <TextField
            {...register('roll')}
            label='Roll'
            fullWidth
            size='small'
            placeholder='Enter roll number'
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
      </Grid2>

      <Box sx={{ display: 'flex' }}>
        <Box sx={{ marginLeft: 'auto', mt: 2 }}>
          <Button
            color='primary'
            size='small'
            startIcon={<Search />}
            onClick={searchStudent}
            variant='contained'
          >
            Search
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
