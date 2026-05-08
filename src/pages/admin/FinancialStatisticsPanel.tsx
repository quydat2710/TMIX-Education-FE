
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Paper, Tabs, Tab, Skeleton } from '@mui/material';
import { useLocation } from 'react-router-dom';

// ─── Sub-components ───
import StatsHeader from './financial/components/StatsHeader';
import KpiSection, { type KpiData } from './financial/components/KpiSection';
import TeacherPaymentsTab from './financial/tabs/TeacherPaymentsTab';
import StudentPaymentsTab from './financial/tabs/StudentPaymentsTab';
import OtherTransactionsTab from './financial/tabs/OtherTransactionsTab';

// ─── Services ───
import { getAllTeacherPaymentsAPI, getAllPaymentsAPI } from '../../services/payments';
import { getAllTransactionsAPI } from '../../services/transactions';

// ─── Design tokens ───
const NAVY = '#1e3a8a';

// ─── Shared types (exported for child tabs) ───
export interface GlobalTimeFilter {
  periodType: string;
  selectedYear: number;
  selectedMonth: number;
  selectedQuarter: number;
  customStart: string;
  customEnd: string;
}

// ─── Helper: build API params from GlobalTimeFilter ───
const buildTeacherParams = (tf: GlobalTimeFilter) => {
  const params: any = { page: 1, limit: 9999 };
  if (tf.periodType === 'month') { params.year = tf.selectedYear; params.month = tf.selectedMonth; }
  else if (tf.periodType === 'quarter') {
    const qMap: Record<number, { s: number; e: number }> = { 1: { s: 1, e: 3 }, 2: { s: 4, e: 6 }, 3: { s: 7, e: 9 }, 4: { s: 10, e: 12 } };
    params.year = tf.selectedYear; params.startMonth = qMap[tf.selectedQuarter].s; params.endMonth = qMap[tf.selectedQuarter].e;
  } else if (tf.periodType === 'year') { params.year = tf.selectedYear; }
  else if (tf.periodType === 'custom') {
    params.year = new Date(tf.customStart).getFullYear();
    params.startMonth = new Date(tf.customStart).getMonth() + 1;
    params.endMonth = new Date(tf.customEnd).getMonth() + 1;
  }
  return params;
};

const buildStudentFilters = (tf: GlobalTimeFilter) => {
  const filters: any = {};
  if (tf.periodType === 'month') { filters.month = tf.selectedMonth; filters.year = tf.selectedYear; }
  else if (tf.periodType === 'quarter') {
    const qMap: Record<number, { s: number; e: number }> = { 1: { s: 1, e: 3 }, 2: { s: 4, e: 6 }, 3: { s: 7, e: 9 }, 4: { s: 10, e: 12 } };
    filters.startMonth = qMap[tf.selectedQuarter].s; filters.endMonth = qMap[tf.selectedQuarter].e; filters.year = tf.selectedYear;
  } else if (tf.periodType === 'year') { filters.year = tf.selectedYear; }
  else if (tf.periodType === 'custom') {
    filters.year = new Date(tf.customStart).getFullYear();
    filters.startMonth = new Date(tf.customStart).getMonth() + 1;
    filters.endMonth = new Date(tf.customEnd).getMonth() + 1;
  }
  return filters;
};

const buildTxDateRange = (tf: GlobalTimeFilter) => {
  const toMDY = (y: number, m: number, d: number) => `${m < 10 ? '0' + m : m}/${d < 10 ? '0' + d : d}/${y}`;
  if (tf.periodType === 'year') return { startDate: toMDY(tf.selectedYear, 1, 1), endDate: toMDY(tf.selectedYear, 12, 31) };
  if (tf.periodType === 'month') {
    const last = new Date(tf.selectedYear, tf.selectedMonth, 0).getDate();
    return { startDate: toMDY(tf.selectedYear, tf.selectedMonth, 1), endDate: toMDY(tf.selectedYear, tf.selectedMonth, last) };
  }
  if (tf.periodType === 'quarter') {
    const qMap: Record<number, { s: number; e: number }> = { 1: { s: 1, e: 3 }, 2: { s: 4, e: 6 }, 3: { s: 7, e: 9 }, 4: { s: 10, e: 12 } };
    const last = new Date(tf.selectedYear, qMap[tf.selectedQuarter].e, 0).getDate();
    return { startDate: toMDY(tf.selectedYear, qMap[tf.selectedQuarter].s, 1), endDate: toMDY(tf.selectedYear, qMap[tf.selectedQuarter].e, last) };
  }
  if (tf.periodType === 'custom' && tf.customStart && tf.customEnd) {
    const [sy, sm, sd] = tf.customStart.split('-').map(Number);
    const [ey, em, ed] = tf.customEnd.split('-').map(Number);
    return { startDate: toMDY(sy, sm, sd), endDate: toMDY(ey, em, ed) };
  }
  return {};
};

// ═══════════════════════════════════════════════
// CONTAINER COMPONENT
// ═══════════════════════════════════════════════
const FinancialStatisticsPanel: React.FC = () => {
  const location = useLocation();
  const navState = location.state as { tab?: string } | null;
  const defaultTab = navState?.tab === 'teacher' ? 0 : 0;

  // ─── Global State ───
  const [tab, setTab] = useState<number>(defaultTab);
  const [kpiLoading, setKpiLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<GlobalTimeFilter>({
    periodType: 'year',
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
    customStart: new Date().toISOString().split('T')[0].substring(0, 8) + '01',
    customEnd: new Date().toISOString().split('T')[0],
  });

  const [kpiData, setKpiData] = useState<KpiData>({
    totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0,
    totalTeacherSalary: 0, totalTeacherPaid: 0, otherRevenue: 0, otherExpense: 0,
  });

  const updateTimeFilter = useCallback((key: keyof GlobalTimeFilter, value: any) => {
    setTimeFilter(prev => ({ ...prev, [key]: value }));
  }, []);

  // ─── Fetch KPI totals (triggered by GlobalTimeFilter changes ONLY) ───
  const fetchKpiTotals = useCallback(async () => {
    setKpiLoading(true);
    try {
      // Concurrent fetch: teacher + student + transactions
      const [teacherRes, studentRes, txRes] = await Promise.all([
        getAllTeacherPaymentsAPI(buildTeacherParams(timeFilter)),
        getAllPaymentsAPI((() => {
          const f = buildStudentFilters(timeFilter);
          const p: any = { page: 1, limit: 9999 };
          if (Object.keys(f).length > 0) p.filters = JSON.stringify(f);
          return p;
        })()),
        getAllTransactionsAPI((() => {
          const range = buildTxDateRange(timeFilter);
          return { page: 1, limit: 9999, ...range } as any;
        })()),
      ]);

      // Parse teacher
      const teacherData = (teacherRes as any)?.data?.data?.result || (teacherRes as any)?.data?.result || [];
      let totalTeacherSalary = 0, totalTeacherPaid = 0;
      if (Array.isArray(teacherData)) {
        totalTeacherSalary = teacherData.reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);
        totalTeacherPaid = teacherData.reduce((s: number, p: any) => s + (p.paidAmount || 0), 0);
      }

      // Parse student
      const studentData = (studentRes as any)?.data?.data?.result || (studentRes as any)?.data?.result || [];
      let totalStudentFees = 0, totalPaidAmount = 0, totalRemainingAmount = 0;
      if (Array.isArray(studentData)) {
        totalStudentFees = studentData.reduce((t: number, p: any) => t + (p.totalAmount ?? 0), 0);
        totalPaidAmount = studentData.reduce((t: number, p: any) => t + (p.paidAmount ?? 0), 0);
        totalRemainingAmount = studentData.reduce((t: number, p: any) => t + ((p.totalAmount ?? 0) - (p.discountAmount ?? 0) - (p.paidAmount ?? 0)), 0);
      }

      // Parse transactions
      const txData = (txRes as any)?.data?.data?.result || (txRes as any)?.data?.result || [];
      let otherRevenue = 0, otherExpense = 0;
      if (Array.isArray(txData)) {
        txData.forEach((t: any) => {
          if (t.category?.type === 'revenue') otherRevenue += (t.amount || 0);
          else otherExpense += (t.amount || 0);
        });
      }

      setKpiData({ totalTeacherSalary, totalTeacherPaid, totalStudentFees, totalPaidAmount, totalRemainingAmount, otherRevenue, otherExpense });
    } catch (err) {
      console.error('Failed to fetch KPI totals:', err);
    } finally {
      setKpiLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => { fetchKpiTotals(); }, [fetchKpiTotals]);

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <Box>
      {/* ═══ 1. StatsHeader (sticky) ═══ */}
      <StatsHeader timeFilter={timeFilter} onTimeFilterChange={updateTimeFilter} />

      {/* ═══ 2. KpiSection ═══ */}
      <KpiSection data={kpiData} loading={kpiLoading} />

      {/* ═══ 3. DetailAnalysisSection ═══ */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}
      >
        {/* ─── TabNavigation ─── */}
        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', bgcolor: '#fafbfc' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none', fontWeight: 500, fontSize: '0.875rem',
                color: '#64748b', minHeight: 48,
                '&.Mui-selected': { color: NAVY, fontWeight: 600 },
              },
              '& .MuiTabs-indicator': { bgcolor: NAVY, height: 2.5, borderRadius: '2px 2px 0 0' },
            }}
          >
            <Tab label="Chi tiết giáo viên" />
            <Tab label="Chi tiết học sinh" />
            <Tab label="Thu chi khác" />
          </Tabs>
        </Box>

        {/* ─── ActiveTabContent ─── */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && <TeacherPaymentsTab globalTimeFilter={timeFilter} />}
          {tab === 1 && <StudentPaymentsTab globalTimeFilter={timeFilter} />}
          {tab === 2 && <OtherTransactionsTab globalTimeFilter={timeFilter} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialStatisticsPanel;
