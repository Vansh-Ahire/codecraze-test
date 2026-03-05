import { useState, useEffect } from 'react';
import {
    FaSearch, FaFilter, FaCalendarAlt, FaCar, FaClock,
    FaTrashAlt, FaCheckCircle, FaExclamationCircle, FaUser
} from 'react-icons/fa';
import { getAdminBookings, adminCancelBooking } from '../services/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getAdminBookings();
            setBookings(res.bookings || []);
        } catch (err) {
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm(`Are you sure you want to cancel booking ${id}?`)) return;
        try {
            await adminCancelBooking(id);
            fetchBookings(); // Refresh list
        } catch (err) {
            alert('Cancellation failed: ' + err.message);
        }
    };

    const filtered = bookings.filter(b => {
        const matchesSearch =
            b.booking_id.toLowerCase().includes(search.toLowerCase()) ||
            b.user.toLowerCase().includes(search.toLowerCase()) ||
            b.vehicle_number?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <span className="w-8 h-8 border-3 border-violet-500/30 border-t-violet-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Syncing Bookings...</p>
            </div>
        );
    }

    return (
        <div className="page-bg pt-[60px]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight leading-none mb-3">
                            Booking <span className="gradient-text">Manifest</span>
                        </h1>
                        <p className="text-gray-500 text-[14px]">Manage and audit all vehicle reservations.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="relative min-w-[240px]">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]" />
                            <input
                                type="text"
                                placeholder="Search ID, User, or Plate..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field input-field-icon"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field max-w-[150px] !py-2.5"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm mb-6 flex items-center gap-2">
                        <FaExclamationCircle /> {error}
                    </div>
                )}

                {/* Bookings Table/Grid */}
                <div className="card-static overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Reference</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">User Details</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Schedule</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Amount</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((b) => (
                                    <tr key={b.booking_id} className="row-hover group">
                                        <td className="px-6 py-5">
                                            <p className="text-[12px] font-bold text-gray-900">#{b.booking_id}</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-mono mt-1">
                                                S{b.slot_number < 10 ? '0' + b.slot_number : b.slot_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <FaUser className="text-[11px]" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-gray-800 leading-none">{b.user}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono mt-1 uppercase tracking-tighter">{b.vehicle_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                                                <FaCalendarAlt className="text-violet-400 text-[10px]" />
                                                <span>{b.date || 'Today'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                                                <FaClock className="text-[9px]" />
                                                <span>{b.duration}hr Reservation</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[14px] font-extrabold text-gray-900">₹{b.amount}</p>
                                            {b.penalty > 0 && <p className="text-[10px] text-red-500 font-bold mt-0.5">+{b.penalty} Penalty</p>}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${b.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {b.status === 'active' && (
                                                <button
                                                    onClick={() => handleCancel(b.booking_id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Cancel Booking"
                                                >
                                                    <FaTrashAlt className="text-[13px]" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div className="p-20 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <FaExclamationCircle className="text-2xl" />
                            </div>
                            <h4 className="text-gray-900 font-bold">No bookings found</h4>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminBookings;
