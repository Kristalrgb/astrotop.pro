'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        console.log('Login success:', data)
        router.push('/profile')
        router.refresh()
      } else {
        setError(data.errors?.[0]?.message || 'Неверный email или пароль')
      }
    } catch (err) {
      setError('Произошла ошибка сети. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-['Georgia']">
      {/* --- ФОНОВЫЕ ЭФФЕКТЫ --- */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(120,53,15,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- КАРТОЧКА ВХОДА --- */}
      <div className="relative z-10 w-full max-w-[400px] mx-auto bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-amber-400 mb-2">
            <Sparkles size={18} />
            <span className="uppercase tracking-widest text-[10px] font-bold font-sans">
              Astra Login
            </span>
          </div>

          {/* ИЗМЕНЕНИЕ ЗДЕСЬ: уменьшил до text-xl на мобильных и text-2xl на ПК */}
          <h1 className="text-4xl md:text-4xl text-white font-['Georgia'] leading-tight break-words font-medium">
            С возвращением!
          </h1>

          <p className="text-slate-400 text-sm mt-3 font-['Georgia'] italic">
            Введите свои данные для входа в пространство
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 ml-1 font-['Georgia']">Email</label>
            <div className="relative group">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
              />
            </div>
          </div>

          {/* Пароль */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 ml-1 font-['Georgia']">Пароль</label>
            <div className="relative group">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"
                size={18}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-sans">
              {error}
            </div>
          )}

          {/* Кнопка Войти */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-['Georgia']"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Войти'}
          </button>

          {/* Ссылки под кнопкой */}
          <div className="flex flex-col items-center gap-4 pt-2 text-sm font-['Georgia']">
            {/* Ссылка на регистрацию */}
            <div className="text-slate-400">
              Нет аккаунта?{' '}
              <Link
                href="/register"
                className="text-amber-400 hover:text-amber-300 transition-colors hover:underline underline-offset-4 italic"
              >
                Зарегистрироваться
              </Link>
            </div>

            {/* Ссылка на восстановление пароля */}
            <Link
              href="/forgot-password"
              className="text-slate-500 hover:text-slate-300 transition-colors text-xs italic"
            >
              Забыли пароль?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
