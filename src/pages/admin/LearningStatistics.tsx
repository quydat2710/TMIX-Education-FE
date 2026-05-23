import React from 'react';
import { Box } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import LearningStatisticsPanel from './LearningStatisticsPanel';

const LearningStatistics: React.FC = () => {
  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <LearningStatisticsPanel />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default LearningStatistics;
