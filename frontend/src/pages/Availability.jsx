import { useState, useEffect } from 'react';
import SlotCard from '../Components/SlotCard';
import StatsCard from '../Components/StatsCard';
import { FaParking, FaCheckCircle, FaTimesCircle, FaSync } from 'react-icons/fa';

const generateSlots = (location = '') => {
  const prices = [30, 40, 50, 60];
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    slotId: `${(location.slice(0, 2).toUpperCase() || 'P')}-${String(i + 1).padStart(3, '0')}`,
    status: Math.random() > 0.45 ? 'available' : 'occupied',
    price: prices[Math.floor(Math.random() * prices.length)],
  }));
};

const Availability = () => {
  const [slots, setSlots]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [bookingInfo, setBookingInfo] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('parkeasy_booking');
    if (stored) setBookingInfo(JSON.parse(stored));
  }, []);

  const loadSlots = () => {
    setLoading(true);
    setTimeout(() => {
      setSlots(generateSlots(bookingInfo?.location || ''));
      setLoading(false);
    }, 700);
  };

  useEffect(() => { loadSlots(); }, [bookingInfo]);

  const filtered       = slots.filter((s) => filter === 'all' || s.status === filter);
  const totalSlots     = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;
  const occupiedSlots  = slots.filter((s) => s.status === 'occupied').length;

  return (
    <div className="page-bg pt-[60px]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          <span className="badge mb-3">🅿️ Live Parking Status</span>
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
            Slot <span className="gradient-text">Availability</span>
          </h1>
          {bookingInfo?.location && (
            <p className="text-gray-500 text-[14px] mt-2">
              Showing slots at{' '}
              <span className="text-violet-600 font-semibold">{bookingInfo.location}</span>
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatsCard icon={<FaParking />}     label="Total Slots"  value={totalSlots}     color="purple" />
          <StatsCard icon={<FaCheckCircle />} label="Available"    value={availableSlots} color="green"  />
          <StatsCard icon={<FaTimesCircle />} label="Occupied"     value={occupiedSlots}  color="red"    />
        </div>

        {/* Toolbar */}
        <div className="card-static px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[13px] text-gray-500">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Available ({availableSlots})
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              Occupied ({occupiedSlots})
            </span>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1.5">
            {['all', 'available', 'occupied'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-all duration-150 ${
                  filter === f
                    ? 'text-white shadow-sm'
                    : 'text-gray-500 bg-white border border-gray-200 hover:text-violet-700 hover:border-violet-200'
                }`}
                style={filter === f ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' } : {}}
              >
                {f}
              </button>
            ))}
            <button
              onClick={loadSlots}
              title="Refresh slots"
              className="ml-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-violet-700 hover:border-violet-200 transition text-[13px]"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-9 h-9 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400">Loading parking slots...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🅿️</p>
            <p className="text-[14px] font-semibold text-gray-500">No slots match the current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((slot, i) => (
              <div key={slot.id} className={`animate-fade-up`} style={{ animationDelay: `${i * 0.03}s` }}>
                <SlotCard slot={slot} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
