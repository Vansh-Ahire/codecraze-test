import { useState, useEffect } from 'react';
import {
    FaChartLine, FaUsers, FaBox, FaExclamationCircle,
    FaDownload, FaCircle, FaUserCircle, FaCheckCircle, FaTimesCircle, FaClock, FaCar
} from 'react-icons/fa';
import {
    getAdminStats,
    getAdminUsers,
    getAdminBookings,
    adminCompleteBooking,
    adminCancelBooking,
    exportAdminReport
} from '../services/api';
import StatsCard from '../Components/StatsCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
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
            const [statsRes, usersRes, bookingsRes] = await Promise.all([
                getAdminStats(),
                getAdminUsers(),
                getAdminBookings()
            ]);
            setStats(statsRes);
            setUsers(usersRes.users || []);
            setBookings(bookingsRes.bookings || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDone = async (bookingId) => {
        try {
            setActionLoading(bookingId);
            await adminCompleteBooking(bookingId);
            await fetchData(); // Refresh data
        } catch (err) {
            alert('Failed to complete booking: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            setActionLoading(bookingId);
            await adminCancelBooking(bookingId);
            await fetchData();
        } catch (err) {
            alert('Failed to cancel: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const blob = await exportAdminReport();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ParkMate_Admin_Report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Export failed: ' + err.message);
        } finally {
            setExportLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#fafafa]">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-500 font-bold tracking-tight animate-pulse">Initializing Command Center...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-[70px]">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-8 bg-violet-600 rounded-full" />
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin <span className="text-violet-600">Command Center</span></h1>
                        </div>
                        <p className="text-gray-500 font-medium ml-5">Operational overview and live booking management.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                            title="Refresh Data"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exportLoading}
                            className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-gray-200"
                        >
                            {exportLoading ? (
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : <FaDownload className="text-xs" />}
                            {exportLoading ? 'Exporting...' : 'Export Report'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatsCard icon={<FaChartLine />} label="Revenue" value={stats?.total_revenue || 0} color="green" suffix="₹" />
                    <StatsCard icon={<FaBox />} label="Active" value={stats?.active_bookings || 0} color="blue" />
                    <StatsCard icon={<FaExclamationCircle />} label="Penalties" value={stats?.total_penalties || 0} color="red" suffix="₹" />
                    <StatsCard icon={<FaUsers />} label="Accounts" value={users.length} color="indigo" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Live Bookings Table */}
                    <div className="xl:col-span-3">
                        <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                                    <FaClock className="text-violet-500" />
                                    Live Booking Stream
                                </h2>
                                <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[11px] font-black uppercase tracking-widest rounded-full">
                                    {bookings.filter(b => b.status === 'active').length} Active
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-8 py-4">Customer / Vehicle</th>
                                            <th className="px-6 py-4">Slot / Time</th>
                                            <th className="px-6 py-4">Payment</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <FaBox className="text-4xl text-gray-100 mb-4" />
                                                        <p className="text-gray-400 font-medium">No live bookings found in the system.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : bookings.map((booking) => (
                                            <tr key={booking.booking_id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-500 transition-colors">
                                                            <FaUserCircle className="text-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{booking.user_name || 'Guest Driver'}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <FaCar className="text-[10px] text-gray-400" />
                                                                <p className="text-[12px] font-mono text-gray-500 uppercase">{booking.vehicle_number}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-bold text-gray-900">Slot {booking.slot_number}</p>
                                                        <p className="text-[12px] text-gray-900 font-extrabold mt-1">
                                                            {booking.checkin_time ? new Date(booking.checkin_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 font-bold mt-0.5">
                                                            {booking.checkin_time ? new Date(booking.checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} • {booking.duration}h
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-sm font-bold text-gray-900">₹{booking.amount}</p>
                                                    <p className="text-[11px] text-emerald-500 font-bold uppercase mt-0.5">Paid via Card</p>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusStyle(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {booking.status === 'active' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMarkDone(booking.booking_id)}
                                                                    disabled={actionLoading === booking.booking_id}
                                                                    className="btn-primary !h-9 !px-4 !text-[11px] flex items-center gap-2 disabled:opacity-50"
                                                                >
                                                                    {actionLoading === booking.booking_id ? (
                                                                        <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                                    ) : <FaCheckCircle />}
                                                                    Mark Done
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancel(booking.booking_id)}
                                                                    disabled={actionLoading === booking.booking_id}
                                                                    className="w-9 h-9 border border-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                    title="Cancel Booking"
                                                                >
                                                                    <FaTimesCircle />
                                                                </button>
                                                            </>
                                                        )}
                                                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                                            <span className="text-[11px] text-gray-300 font-medium">N/A</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Sidebar - System Users */}
                    <div className="xl:col-span-1">
                        <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm flex flex-col h-full overflow-hidden">
                            <div className="p-8 border-b border-gray-50">
                                <h3 className="font-extrabold text-gray-900 text-lg">System Access</h3>
                                <p className="text-[13px] text-gray-400 mt-1">Recently logged users and staff.</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {users.slice(0, 10).map((u, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-bold border border-violet-100">
                                            {u.name ? u.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-bold text-gray-800 truncate">{u.name || u.username}</p>
                                            <p className="text-[11px] text-gray-400 truncate tracking-tight">{u.email || u.username}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {u.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Users: {users.length}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
