import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

export default function Login() {
  const [name, setName] = useState('');
  const { login, settings } = useApp();
  const navigate = useNavigate();
  const t = translations[settings.language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card p-10 w-full max-w-md relative z-10 mx-4 animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <Wallet size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t.login.welcome}</h1>
          <p className="text-gray-400">{t.login.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300 ml-1">
              {t.login.nameLabel}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.login.namePlaceholder}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            {t.login.button}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
