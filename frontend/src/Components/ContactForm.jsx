import { useState } from 'react';
import { FaUser, FaEnvelope, FaCommentAlt, FaPaperPlane, FaCheckCircle, FaChevronDown } from 'react-icons/fa';

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const subjects = ['General Inquiry', 'Booking Support', 'Payment Issue', 'Partnership', 'Feedback', 'Other'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await new Promise((res) => setTimeout(res, 1500));
      setSent(true);
    } catch {
      setError('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="card-static p-12 text-center animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-violet-500 text-xl" />
        </div>
        <h3 className="text-[18px] font-extrabold text-gray-900 mb-1.5">Message Sent!</h3>
        <p className="text-[13px] text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
        <button
          onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
          className="btn-primary px-6 py-2.5 text-[13px]"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="card-static p-7">
      <h3 className="text-[16px] font-bold text-gray-900 mb-6">Send a Message</h3>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Your Name</label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="John Doe" required
                className="input-field input-field-icon" id="contact-name"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 text-[11px]" />
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="john@example.com" required
                className="input-field input-field-icon" id="contact-email"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Subject</label>
          <div className="relative">
            <select
              name="subject" value={form.subject} onChange={handleChange} required
              className="input-field pr-9 appearance-none cursor-pointer" id="contact-subject"
            >
              <option value="" disabled>Select a subject</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[9px]" />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Message</label>
          <div className="relative">
            <FaCommentAlt className="absolute left-3.5 top-3.5 text-violet-400 text-[11px]" />
            <textarea
              name="message" value={form.message} onChange={handleChange}
              placeholder="How can we help you?" required rows={5}
              className="input-field input-field-icon resize-none" id="contact-message"
            />
          </div>
        </div>

        <hr className="divider" />

        <button
          type="submit" disabled={loading} id="contact-send-btn"
          className="w-full btn-primary py-3.5 text-[14px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <><FaPaperPlane className="text-[12px]" /> Send Message</>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
