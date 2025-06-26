import * as React from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid2,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Alert
} from '@mui/material';
import { Controller, UseFormReturn } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';

import { NoticeFormProps, RecipientListData } from '../types';
import { noticeStatusList } from '@/constants';
import { useLazyGetNoticeRecipientListQuery } from '../api';

type Props = {
  isSaving: boolean;
  onSubmit: () => void;
  methods: UseFormReturn<NoticeFormProps>;
  handleRoleChange: (event: SelectChangeEvent<string | number>) => void;
  handleRecipientChange: (event: SelectChangeEvent<string | number>) => void;
  selectedRoleId: number;
};

export const NoticeForm: React.FC<Props> = ({
  isSaving,
  methods,
  onSubmit,
  handleRoleChange,
  handleRecipientChange,
  selectedRoleId
}) => {
  const [getRecipients] = useLazyGetNoticeRecipientListQuery();
  const {
    register,
    formState: { errors },
    control,
    watch
  } = methods;

  const [recipients, setRecipients] = React.useState<RecipientListData>([]);
  const [apiError, setApiError] = React.useState<boolean>(false);

  const recipientWatch = watch('recipientType');

  // Fallback recipients data if API fails or is empty
  const fallbackRecipients: RecipientListData = [
    {
      id: 1,
      roleId: 1,
      name: 'Students',
      primaryDependents: {
        name: 'Class',
        list: [
          { name: 'Class 1', id: 'class-1' },
          { name: 'Class 2', id: 'class-2' },
          { name: 'Class 3', id: 'class-3' },
          { name: 'Class 4', id: 'class-4' },
          { name: 'Class 5', id: 'class-5' },
          { name: 'Class 6', id: 'class-6' },
          { name: 'Class 7', id: 'class-7' },
          { name: 'Class 8', id: 'class-8' },
          { name: 'Class 9', id: 'class-9' },
          { name: 'Class 10', id: 'class-10' },
          { name: 'Class 11', id: 'class-11' },
          { name: 'Class 12', id: 'class-12' }
        ]
      }
    },
    {
      id: 2,
      roleId: 2,
      name: 'Teachers',
      primaryDependents: {
        name: 'Department',
        list: [
          { name: 'Mathematics', id: 'dept-math' },
          { name: 'Science', id: 'dept-science' },
          { name: 'English', id: 'dept-english' },
          { name: 'History', id: 'dept-history' },
          { name: 'Geography', id: 'dept-geography' },
          { name: 'Physics', id: 'dept-physics' },
          { name: 'Chemistry', id: 'dept-chemistry' },
          { name: 'Biology', id: 'dept-biology' },
          { name: 'Computer Science', id: 'dept-cs' },
          { name: 'Physical Education', id: 'dept-pe' }
        ]
      }
    },
    {
      id: 3,
      roleId: 3,
      name: 'Parents',
      primaryDependents: {
        name: 'Student Class',
        list: [
          { name: 'Class 1 Parents', id: 'parents-1' },
          { name: 'Class 2 Parents', id: 'parents-2' },
          { name: 'Class 3 Parents', id: 'parents-3' },
          { name: 'Class 4 Parents', id: 'parents-4' },
          { name: 'Class 5 Parents', id: 'parents-5' },
          { name: 'Class 6 Parents', id: 'parents-6' },
          { name: 'Class 7 Parents', id: 'parents-7' },
          { name: 'Class 8 Parents', id: 'parents-8' },
          { name: 'Class 9 Parents', id: 'parents-9' },
          { name: 'Class 10 Parents', id: 'parents-10' },
          { name: 'Class 11 Parents', id: 'parents-11' },
          { name: 'Class 12 Parents', id: 'parents-12' }
        ]
      }
    },
    {
      id: 4,
      roleId: 4,
      name: 'Staff',
      primaryDependents: {
        name: 'Department',
        list: [
          { name: 'Administration', id: 'staff-admin' },
          { name: 'Maintenance', id: 'staff-maintenance' },
          { name: 'Security', id: 'staff-security' },
          { name: 'Library', id: 'staff-library' },
          { name: 'Transport', id: 'staff-transport' },
          { name: 'Cafeteria', id: 'staff-cafeteria' },
          { name: 'IT Support', id: 'staff-it' },
          { name: 'Medical', id: 'staff-medical' }
        ]
      }
    }
  ];

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getRecipients().unwrap();
        if (result.noticeRecipients && result.noticeRecipients.length > 0) {
          setRecipients(result.noticeRecipients);
          setApiError(false);
        } else {
          // API returned empty data, use fallback
          setRecipients(fallbackRecipients);
          setApiError(true);
        }
      } catch (error) {
        console.log('API Error:', error);
        // API failed, use fallback data
        setRecipients(fallbackRecipients);
        setApiError(true);
      }
    };
    fetch();
  }, [getRecipients]);

  const getDependentFields = () => {
    const role = recipients.find((r) => r.roleId === selectedRoleId);
    if (!role) return { primaryDependents: [] };

    return {
      primaryDependents: role.primaryDependents.list || []
    };
  };

  const getDependentRole = (type: 'primaryDependents') => {
    const role = recipients.find((r) => r.roleId === selectedRoleId)?.[type];
    return role?.name || 'Category';
  };

  const { primaryDependents } = getDependentFields();

  return (
    <form onSubmit={onSubmit}>
      <TextField
        {...register('title')}
        error={Boolean(errors.title)}
        helperText={errors.title?.message}
        type='text'
        label='Title'
        placeholder='Enter notice title'
        fullWidth
        size='small'
        sx={{ marginTop: '20px' }}
      />
      <TextField
        {...register('description')}
        error={Boolean(errors.description)}
        helperText={errors.description?.message}
        type='text'
        label='Description'
        placeholder='Enter notice description'
        size='small'
        multiline
        minRows={3}
        maxRows={10}
        fullWidth
        sx={{ marginTop: '30px' }}
      />
      <FormControl
        sx={{ marginTop: '30px', minWidth: { xs: '100%', md: '350px' } }}
        size='small'
        error={Boolean(errors.status)}
      >
        <InputLabel id='notice-status-label' shrink>
          Status
        </InputLabel>
        <Controller
          name='status'
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <Select
                label='Status'
                labelId='notice-status-label'
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                notched
              >
                <MenuItem value='' disabled>
                  <em>Select Status</em>
                </MenuItem>
                {noticeStatusList.map(({ name, id }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{error?.message}</FormHelperText>
            </>
          )}
        />
      </FormControl>

      <Box>
        <FormControl sx={{ mt: 3 }}>
          <FormLabel>Recipient</FormLabel>
          <Controller
            name='recipientType'
            control={control}
            render={({ field: { onChange, value } }) => (
              <RadioGroup
                row
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  handleRecipientChange(e);
                }}
              >
                <FormControlLabel value='EV' control={<Radio size='small' />} label='Everyone' />
                <FormControlLabel value='SP' control={<Radio size='small' />} label='Specific' />
              </RadioGroup>
            )}
          />
        </FormControl>
      </Box>

      {/* Show warning if using fallback data */}
      {apiError && recipientWatch === 'SP' && (
        <Alert severity='info' sx={{ mt: 2, mb: 2 }}>
          Using default recipient options. Some data may not be current.
        </Alert>
      )}

      {recipientWatch === 'SP' && (
        <Grid2 container spacing={2} sx={{ mt: 1 }}>
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <FormControl size='small' fullWidth error={Boolean(errors.recipientRole)}>
              <InputLabel id='role' shrink>
                Role
              </InputLabel>
              <Controller
                name='recipientRole'
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <Select
                      label='Role'
                      labelId='role'
                      value={value || ''}
                      notched
                      onChange={(e) => {
                        onChange(e.target.value);
                        handleRoleChange(e);
                      }}
                    >
                      <MenuItem value='' disabled>
                        <em>Select Role</em>
                      </MenuItem>
                      {recipients.map((item) => (
                        <MenuItem key={item.roleId} value={item.roleId}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </>
                )}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 4 }}>
            {selectedRoleId && (
              <FormControl
                sx={{ minWidth: { xs: '100%', md: '350px' } }}
                size='small'
                error={Boolean(errors.firstField)}
              >
                <InputLabel id='firstField' shrink>
                  {getDependentRole('primaryDependents')}
                </InputLabel>
                <Controller
                  name='firstField'
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <>
                      <Select
                        labelId='firstField'
                        value={value || ''}
                        onChange={(e) => {
                          onChange(e.target.value);
                        }}
                        label={getDependentRole('primaryDependents')}
                        notched
                      >
                        <MenuItem value='' disabled>
                          <em>Select {getDependentRole('primaryDependents')}</em>
                        </MenuItem>
                        {primaryDependents.length > 0 ? (
                          primaryDependents.map(({ name, id }) => (
                            <MenuItem key={id || name} value={name}>
                              {name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value='all'>
                            All {getDependentRole('primaryDependents')}
                          </MenuItem>
                        )}
                      </Select>
                      <FormHelperText>{error?.message}</FormHelperText>
                    </>
                  )}
                />
              </FormControl>
            )}
          </Grid2>
        </Grid2>
      )}

      <LoadingButton
        loading={isSaving}
        type='submit'
        size='medium'
        variant='contained'
        sx={{ margin: '30px 0 10px 0' }}
      >
        Save
      </LoadingButton>
    </form>
  );
};
