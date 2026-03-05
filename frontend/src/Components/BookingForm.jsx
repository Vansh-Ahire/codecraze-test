import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSearch, FaChevronDown } from 'react-icons/fa';

const locations = [
  'Downtown Parking Hub',
  'Airport Terminal A',
  'Airport Terminal B',
  'Mall Central Parking',
  'Tech Park Zone 1',
  'Tech Park Zone 2',
  'Railway Station Lot',
  'City Center Garage',
];

const BookingForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicleNumber: '',
    location: '',
    date: '',
    time: '',
    duration: '1',
  });
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('parkeasy_booking', JSON.stringify(form));
    setTimeout(() => { setLoading(false); navigate('/availability'); }, 1000);
  };

  const durations = ['1', '2', '3', '4', '6', '8', '12', '24'];

  return (
    <form onSubmit={handleSubmit} className="card-static p-8 space-y-5">
      {/* Vehicle Number */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
          Vehicle Number
        </label>
        <div className="relative">
          <FaCar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
          <input
            type="text"
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={handleChange}
            placeholder="e.g. MH 12 AB 3456"
            required
            className="input-field input-field-icon uppercase font-mono tracking-wider"
            id="booking-vehicle-input"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
          Parking Location
        </label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px] z-10" />
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="input-field input-field-icon pr-9 appearance-none cursor-pointer"
            id="booking-location-select"
          >
            <option value="" disabled>Select a location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]" />
        </div>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={today}
              required
              className="input-field input-field-icon cursor-pointer"
              id="booking-date-input"
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Time</label>
          <div className="relative">
            <FaClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-500 text-[13px]" />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="input-field input-field-icon cursor-pointer"
              id="booking-time-input"
            />
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">
          Duration (hours)
        </label>
        <div className="flex gap-2 flex-wrap">
          {durations.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setForm({ ...form, duration: d })}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold border-[1.5px] transition-all duration-150 ${
                form.duration === d
                  ? 'border-transparent text-white shadow-sm icon-purple'
                  : 'border-gray-200 text-gray-500 bg-white hover:border-violet-300 hover:text-violet-700'
              }`}
              style={form.duration === d ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' } : {}}
            >
              {d}h
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="divider" />

      <button
        type="submit"
        disabled={loading}
        id="booking-submit-btn"
        className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Checking Availability...
          </>
        ) : (
          <>
            <FaSearch className="text-xs opacity-80" /> Check Availability
          </>
        )}
      </button>
    </form>
  );
};

export default BookingForm;
