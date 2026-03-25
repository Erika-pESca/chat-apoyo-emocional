import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/chat');
    } catch (err: any) {
      let friendlyMessage = err.message || 'Error al iniciar sesión';
      
      if (err.message === 'Invalid login credentials') {
        friendlyMessage = 'El correo o la contraseña son incorrectos. Por favor, verifica tus datos.';
      } else if (err.message === 'Email not confirmed') {
        friendlyMessage = 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
      {/* Soft background glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#e0e7ff_0%,transparent_50%)] opacity-40"></div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-1000">
        {/* Simplified Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-indigo-100 border border-slate-100 mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Coaching Emocional</h1>
          <p className="text-slate-400 font-medium mt-2">Tu espacio de crecimiento y liderazgo</p>
        </div>

        {/* Clean Premium Card */}
        <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Iniciar sesión</h2>
            <p className="text-sm text-slate-400 font-medium">Gestiona tu evolución estratégica</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold flex items-center space-x-2">
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Correo corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-slate-800 transition-all outline-none font-medium placeholder:text-slate-300"
                placeholder="nombre@ejemplo.com"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-slate-800 transition-all outline-none font-medium placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-[0.98] mt-2 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Entrar al chat</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-600 font-bold transition-colors">
            Crear una ahora
          </Link>
        </p>
      </div>
    </div>
  );
}