import BookingForm from '../Components/BookingForm';

const tips = [
  { emoji: '⚡', text: 'Real-time updates every 60 seconds' },
  { emoji: '📱', text: 'Instant confirmation via SMS & email' },
  { emoji: '🔄', text: 'Free cancellation up to 30 mins before' },
  { emoji: '💳', text: 'Pay securely with card or UPI' },
];

const popularSpots = [
  { name: 'Downtown Parking Hub', slots: 14 },
  { name: 'Airport Terminal A', slots: 7 },
  { name: 'Mall Central Parking', slots: 22 },
];

const BookSlot = () => (
  <div className="page-bg pt-[60px]">
    {/* Background blurs */}
    <div className="pointer-events-none fixed top-1/4 -left-32 w-96 h-96 bg-violet-300/20 rounded-full blur-[100px]" />
    <div className="pointer-events-none fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-300/15 rounded-full blur-[100px]" />

    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 relative">
      {/* Page Header */}
      <div className="mb-8">
        <span className="badge mb-3">📅 Reserve Your Spot</span>
        <h1 className="text-[36px] sm:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mt-2">
          Book a <span className="gradient-text">Parking Slot</span>
        </h1>
        <p className="text-gray-500 text-[14px] mt-2 max-w-md">
          Fill in the details below and we'll find the best available spots in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Form */}
        <div className="lg:col-span-3">
          <BookingForm />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tips */}
          <div className="card-static p-6">
            <p className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-xs">💡</span>
              Booking Tips
            </p>
            <div className="space-y-3">
              {tips.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm flex-shrink-0">{t.emoji}</span>
                  <p className="text-[13px] text-gray-500 leading-snug pt-1">{t.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Spots */}
          <div className="card-static p-6">
            <p className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-red-50 flex items-center justify-center text-xs">🔥</span>
              Popular Locations
            </p>
            <div className="space-y-1">
              {popularSpots.map((s, i) => (
                <div key={i} className="row-hover flex items-center justify-between py-2.5 px-1 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] text-gray-400">📍</span>
                    <span className="text-[13px] font-medium text-gray-700">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-emerald-600">{s.slots} slots</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BookSlot;
