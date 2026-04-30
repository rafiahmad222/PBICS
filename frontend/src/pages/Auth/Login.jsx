import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import myImage from '../../assets/gambar-pb.png';
import logo from '../../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-secondary-light">

            <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl border border-secondary-dark/20 relative z-10 animate-fade-in overflow-hidden flex flex-col md:flex-row h-[600px]">

                {/* Image Side */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src={myImage}
                        alt="Beauty Clinic Interior"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>

                {/* Form Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden bg-white">
                            <img src={logo} alt="Personal Beauty Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-bold text-primary">Selamat Datang!</h1>
                        <p className="text-primary-light mt-1">Masuk untuk mengakses sistem rekam medis...</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                <input
                                    type="text"
                                    placeholder="Masukkan Username Anda"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30 transition-all font-medium text-primary"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan Password Anda"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30 transition-all font-medium text-primary"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100 animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-secondary py-3 rounded-xl hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Memuat...' : (
                                <>
                                    Masuk <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
