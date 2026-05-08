import React from 'react';
import { Grid } from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import StatCard from './StatCard';

// ─── Design tokens ───
const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  teal: '#14b8a6',
  purple: '#8b5cf6',
};

export interface KpiData {
  totalStudentFees: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalTeacherSalary: number;
  totalTeacherPaid: number;
  otherRevenue: number;
  otherExpense: number;
}

interface KpiSectionProps {
  data: KpiData;
  loading: boolean;
}

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}tr`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return val.toLocaleString();
};

const KpiSection: React.FC<KpiSectionProps> = ({ data, loading }) => {
  const totalRevenue = data.totalPaidAmount + data.otherRevenue;
  const totalExpense = data.totalTeacherPaid + data.otherExpense;
  const profit = totalRevenue - totalExpense;
  const debtRate = data.totalStudentFees > 0
    ? ((data.totalRemainingAmount / data.totalStudentFees) * 100).toFixed(1)
    : '0';

  return (
    <>
      {/* ═══ Row 1: Summary ═══ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="TỔNG THU"
            value={`${formatCurrency(totalRevenue)} ₫`}
            icon={<TrendingUpIcon />}
            accent={CHART_COLORS.success}
            subtitle={`HP: ${formatCurrency(data.totalPaidAmount)} + Khác: ${formatCurrency(data.otherRevenue)}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="TỔNG CHI"
            value={`${formatCurrency(totalExpense)} ₫`}
            icon={<TrendingDownIcon />}
            accent={CHART_COLORS.danger}
            subtitle={`Lương: ${formatCurrency(data.totalTeacherPaid)} + Khác: ${formatCurrency(data.otherExpense)}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="LỢI NHUẬN"
            value={`${profit >= 0 ? '+' : ''}${formatCurrency(profit)} ₫`}
            icon={<AccountBalanceIcon />}
            accent={profit >= 0 ? CHART_COLORS.teal : CHART_COLORS.danger}
            subtitle={profit >= 0 ? 'Dương — Hoạt động hiệu quả' : 'Âm — Cần xem xét chi phí'}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="CÔNG NỢ HỌC PHÍ"
            value={`${formatCurrency(data.totalRemainingAmount)} ₫`}
            icon={<WarningIcon />}
            accent={CHART_COLORS.warning}
            subtitle={`Tỷ lệ nợ: ${debtRate}% trên ${formatCurrency(data.totalStudentFees)} HP`}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ═══ Row 2: Breakdown ═══ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="LƯƠNG GIÁO VIÊN"
            value={`${formatCurrency(data.totalTeacherSalary)} ₫`}
            icon={<AccountBalanceIcon />}
            accent={CHART_COLORS.danger}
            subtitle={`Đã trả: ${formatCurrency(data.totalTeacherPaid)}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="TỔNG HỌC PHÍ"
            value={`${formatCurrency(data.totalStudentFees)} ₫`}
            icon={<SchoolIcon />}
            accent={CHART_COLORS.primary}
            subtitle={`Đã thu: ${formatCurrency(data.totalPaidAmount)}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="THU KHÁC"
            value={`${formatCurrency(data.otherRevenue)} ₫`}
            icon={<TrendingUpIcon />}
            accent={CHART_COLORS.teal}
            subtitle="Phí thi thử, dịch vụ..."
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="CHI KHÁC"
            value={`${formatCurrency(data.otherExpense)} ₫`}
            icon={<TrendingDownIcon />}
            accent={CHART_COLORS.purple}
            subtitle="Điện, nước, thuê phòng..."
            loading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default KpiSection;
