import { useState, useEffect } from 'react';
import { FaSync, FaShieldAlt } from 'react-icons/fa';

const OtpModal = ({ show, email, onVerify, onCancel, onResend, loading, error }) => {
    const [code, setCode] = useState('');

    useEffect(() => {
        if (show) setCode('');
    }, [show]);

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onVerify(code);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-scale-in">
                <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600" />

                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner text-violet-600">
                            <FaShieldAlt />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">Identity Verification</h3>
                        <p className="text-[13px] text-gray-500 mt-2">
                            We've sent a 6-digit code to <span className="text-violet-600 font-bold">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600 text-center font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                maxLength="6"
                                id="otp-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••••"
                                required
                                className="w-full text-center text-3xl font-black tracking-[12px] py-4 rounded-2xl border-2 border-gray-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none placeholder:text-gray-200"
                            />
                            <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                                <FaSync className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Validating...' : 'Secure Verification'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full btn-primary py-4 rounded-2xl text-[15px] font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform transition active:scale-[0.98]"
                            >
                                {loading ? 'Verifying...' : 'Confirm Verification'}
                            </button>

                            <div className="flex items-center justify-between mt-2">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="text-[13px] font-bold text-gray-400 hover:text-gray-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={onResend}
                                    className="text-[13px] font-bold text-violet-600 hover:text-violet-800 transition"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OtpModal;
