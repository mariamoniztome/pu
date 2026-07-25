import { useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Appointment } from '../../types/appointment';
import { useTranslation } from '../../hooks/useTranslation';
import { themeColor } from '../../lib/theme/applyTheme';

interface DashboardChartProps {
  appointments: Appointment[];
}

export function DashboardChart({ appointments }: DashboardChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    // Group appointments by type and count them
    const appointmentsByType: Record<string, number> = {
      initial: 0,
      'follow-up': 0,
      assessment: 0,
      therapy: 0,
      other: 0,
    };

    // Also get data by status for a second chart
    const appointmentsByStatus: Record<string, number> = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    };

    appointments.forEach((apt) => {
      appointmentsByType[apt.type]++;
      appointmentsByStatus[apt.status]++;
    });

    // Transform for nivo bar chart - showing both type and status
    return [
      {
        type: t('appointments.type.initial'),
        count: appointmentsByType.initial,
        countByStatus: appointmentsByStatus.completed,
      },
      {
        type: t('appointments.type.followUp'),
        count: appointmentsByType['follow-up'],
        countByStatus: appointmentsByStatus.confirmed,
      },
      {
        type: t('appointments.type.assessment'),
        count: appointmentsByType.assessment,
        countByStatus: appointmentsByStatus.scheduled,
      },
      {
        type: t('appointments.type.therapy'),
        count: appointmentsByType.therapy,
        countByStatus: appointmentsByStatus.cancelled,
      },
      {
        type: t('appointments.type.other'),
        count: appointmentsByType.other,
        countByStatus: appointmentsByStatus['no-show'],
      },
    ];
  }, [appointments, t]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <ResponsiveBar
        data={chartData}
        keys={['count', 'countByStatus']}
        indexBy="type"
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        padding={0.3}
        colors={[themeColor('--brand-500'), themeColor('--accent-500')]}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t('appointments.appointmentType'),
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: t('common.count'),
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
        ariaLabel={t('dashboard.appointmentStatsChartLabel')}
        tooltip={({ value, indexValue }) => (
          <div
            style={{
              background: '#ffffff',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              color: '#333',
            }}
          >
            <strong>{indexValue}</strong>: {value}
          </div>
        )}
      />
    </div>
  );
}
