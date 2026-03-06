import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUserShield, FaArrowRight, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { loginUser } from '../services/api';

const AdminLogin = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // If already logged in as admin, redirect to dashboard
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('parkeasy_user') || '{}');
        if (user.role === 'admin') {
            navigate('/admin');
        }
    }, [navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginUser(form);

            if (data.role !== 'admin') {
                throw new Error('Access Denied: Administrator privileges required.');
            }

            localStorage.setItem('parkeasy_token', data.token);
            localStorage.setItem('parkeasy_user', JSON.stringify({
                username: data.username,
                name: data.name,
                role: data.role,
            }));

            navigate('/admin');
            window.location.reload(); // Refresh to update context/navbar
        } catch (err) {
            setError(err.message || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>

            <div className="relative w-full max-w-[440px] px-6">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-violet-900/20 group">
                            <FaShieldAlt className="text-white text-xl group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">ParkMate <span className="text-violet-500">Admin</span></span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Restricted Access · Authorized Personnel Only</p>
                </div>

                {/* Login Card */}
                <div className="bg-[#12121e]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent rounded-full" />

                    <h2 className="text-xl font-bold text-white mb-8 text-center">Command Center Login</h2>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Admin ID / Email</label>
                            <div className="relative group">
                                <FaUserShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" />
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Admin Access Key"
                                    required
                                    className="w-full bg-[#1c1c2d] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#1c1c2d] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                >
                                    {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Enter Command Center
                                    <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[11px] text-gray-600">
                            By accessing this terminal, you agree to the <br />
                            <span className="text-gray-400 font-bold hover:text-violet-400 cursor-pointer">Security Protocols</span> & <span className="text-gray-400 font-bold hover:text-violet-400 cursor-pointer">Terms of Use</span>
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="mt-8 text-center text-gray-700 text-[10px] font-bold uppercase tracking-[0.2em]">
                    System Engine v1.0.4 · Encrypted Session
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
