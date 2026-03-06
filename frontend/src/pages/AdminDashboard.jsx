import { useState, useEffect } from 'react';
import {
    FaChartLine, FaUsers, FaBox, FaExclamationCircle,
    FaDownload, FaParking, FaCircle, FaUserCircle
} from 'react-icons/fa';
import { getAdminStats, getAdminUsers, exportAdminReport, toggleSlotStatus } from '../services/api';
import StatsCard from '../Components/StatsCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('parkeasy_user') || '{}');
        if (user.role !== 'admin') {
            window.location.href = '/admin-login';
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                getAdminStats(),
                getAdminUsers()
            ]);
            setStats(statsRes);
            setUsers(usersRes.users || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const blob = await exportAdminReport();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'AntiGravity_Park_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Export failed: ' + err.message);
        } finally {
            setExportLoading(false);
        }
    };

    const handleToggleSlot = async (slotNum) => {
        try {
            await toggleSlotStatus(slotNum);
            fetchData(); // Refresh stats
        } catch (err) {
            alert('Failed to update slot: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Initializing Admin Core...</p>
            </div>
        );
    }

    return (
        <div className="page-bg pt-[60px]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-[32px] sm:text-[40px] font-extrabold text-gray-900 tracking-tight leading-none mb-3">
                            Admin <span className="gradient-text">Command Center</span>
                        </h1>
                        <p className="text-gray-500 text-[15px]">Real-time analytics and system management.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="btn-primary px-6 py-3 rounded-xl shadow-lg hover:shadow-violet-200/50 transition-all flex items-center gap-2"
                    >
                        {exportLoading ? (
                            <FaCircle className="animate-pulse text-[10px]" />
                        ) : (
                            <FaDownload className="text-[14px]" />
                        )}
                        {exportLoading ? 'Generating...' : 'Export Analytics (Excel)'}
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-shake">
                        <FaExclamationCircle /> {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatsCard
                        icon={<FaChartLine />}
                        label="Total Revenue"
                        value={stats?.total_revenue || 0}
                        color="green"
                        suffix="INR"
                    />
                    <StatsCard
                        icon={<FaBox />}
                        label="Active Bookings"
                        value={stats?.active_bookings || 0}
                        color="blue"
                    />
                    <StatsCard
                        icon={<FaExclamationCircle />}
                        label="Penalty Collected"
                        value={stats?.total_penalties || 0}
                        color="red"
                        suffix="INR"
                    />
                    <StatsCard
                        icon={<FaUsers />}
                        label="Registered Users"
                        value={users.length}
                        color="indigo"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Users */}
                    <div className="lg:col-span-1">
                        <div className="card-static h-full">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 text-[16px]">Recent Access</h3>
                                <span className="badge">Active</span>
                            </div>
                            <div className="p-4 space-y-1">
                                {users.slice(0, 8).map((u, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                            <FaUserCircle className="text-xl" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-bold text-gray-800 truncate">{u.name || u.username}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{u.email || u.username}</p>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                                            {u.role}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Slot Grid System */}
                    <div className="lg:col-span-2">
                        <div className="card-static">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-[16px]">Slot Management</h3>
                                    <p className="text-[11px] text-gray-400 mt-1">Manual status override for parking slots.</p>
                                </div>
                                <div className="flex gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><FaCircle className="text-emerald-500 text-[8px]" /> {stats?.slots_summary.free} Free</span>
                                    <span className="flex items-center gap-1.5"><FaCircle className="text-red-500 text-[8px]" /> {stats?.slots_summary.occupied} Occupied</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-8 gap-4">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const slotNum = i + 1;
                                        // For demo/simplicity - if we don't have real slot data mapped, just show the grid
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleToggleSlot(slotNum)}
                                                className="group relative flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                                            >
                                                <FaParking className="text-gray-300 group-hover:text-violet-400 transition-colors text-xl mb-1" />
                                                <span className="text-[10px] font-bold text-gray-500">S{slotNum < 10 ? '0' + slotNum : slotNum}</span>
                                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
