// React hooks import kar rahe hain
import React, { useEffect, useState } from 'react';
// Lucide icons
import { UserCheck, AlertTriangle, Calendar, Filter, CheckCircle2 } from 'lucide-react';
// Axios API instance
import api from '../../services/api';
// Reusable UI components: StatCard, Badge, DataTable, LoadingSkeleton
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { DataTable } from '../../components/common/DataTable';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

// Student Attendance Analytics Page Component
export const AttendancePage = () => {
  // Loading status state
  const [loading, setLoading] = useState(true);
  // Backend se aane wala complete student summary data
  const [attendanceData, setAttendanceData] = useState(null);
  // Subject dropdown filter state
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Component mount hone par attendance data fetch kar rahe hain
  useEffect(() => {
    fetchAttendance();
  }, []);

  // Backend API se student attendance analytics fetch karne ka function
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/student-summary');
      if (res.data.success) {
        setAttendanceData(res.data.data);
      }
    } catch (err) {
      console.error("Attendance fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Jab tak data load ho raha hai, tab tak skeleton placeholder table render karte hain
  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  // Overall attendance percentage calculate kar rahe hain (Default 100%)
  const overall = attendanceData?.overall_percentage ?? 100;
  // 75% rule ke according critical attendance alert check kar rahe hain
  const isCritical = overall < 75;

  // Selected subject ke hisab se recent records filter kar rahe hain
  const filteredRecords = (attendanceData?.recent_records || []).filter(r => {
    if (selectedSubject === 'all') return true;
    return r.subject_code === selectedSubject;
  });

  // DataTable columns definition
  const columns = [
    {
      header: 'Date',
      accessor: 'session_date',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {new Date(row.session_date).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Subject',
      accessor: 'subject_name',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-800">{row.subject_name}</p>
          <p className="text-[10px] font-mono text-slate-400">{row.subject_code}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Session Topic / Remarks',
      accessor: 'remarks',
      render: (row) => (
        <span className="text-xs text-slate-500 italic">
          {row.remarks || 'Regular classroom attendance'}
        </span>
      )
    }
  ];

  // Component UI Layout
  return (
    <div className="space-y-8">
      {/* Page Header Title and Subtitle */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Attendance Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed breakdown of lecture attendance records and statutory examination eligibility (75% rule)
        </p>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${overall}%`}
          subtitle={`${attendanceData?.total_attended || 0} / ${attendanceData?.total_sessions || 0} Total Sessions`}
          icon={UserCheck}
          color={isCritical ? 'rose' : 'emerald'}
          trend={{ positive: !isCritical, text: isCritical ? 'Critical (<75%)' : 'Good Standing', label: 'status' }}
        />
        <StatCard
          title="Total Attended"
          value={attendanceData?.total_attended || 0}
          subtitle="Present + Excused sessions"
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Total Conducted"
          value={attendanceData?.total_sessions || 0}
          subtitle="All recorded subject sessions"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Subject-Wise Attendance Progress Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4">Subject Attendance Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendanceData?.subject_summaries?.map((sub) => {
            const isLow = sub.percentage < 75;
            return (
              <div 
                key={sub.subject_id}
                onClick={() => setSelectedSubject(sub.subject_code === selectedSubject ? 'all' : sub.subject_code)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedSubject === sub.subject_code 
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                      {sub.subject_code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">{sub.subject_name}</h3>
                  </div>
                  <Badge variant={isLow ? 'rose' : 'emerald'} size="sm">
                    {sub.percentage}%
                  </Badge>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Present: {sub.present_count}</span>
                  <span>Absent: {sub.absent_count}</span>
                  <span>Total: {sub.total_sessions}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Attendance History Log Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Class Attendance Log History</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Subjects</option>
              {attendanceData?.subject_summaries?.map(s => (
                <option key={s.subject_id} value={s.subject_code}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paginated interactive table */}
        <DataTable
          columns={columns}
          data={filteredRecords}
          searchKey="subject_name"
          searchPlaceholder="Search attendance records..."
          pageSize={10}
        />
      </div>
    </div>
  );
};

