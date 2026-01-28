'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Стандартный эндпоинт PayloadCMS для сброса пароля
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setIsSuccess(true)
      } else {
        const data = await res.json()
        // Payload может не говорить, что email не найден (в целях безопасности),
        // но если выдал явную ошибку — покажем её.
        setError(data.errors?.[0]?.message || 'Ошибка при отправке запроса')
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
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,53,15,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- КАРТОЧКА --- */}
      <div className="relative z-10 w-full max-w-[400px] mx-auto bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-500">
        {/* Хедер (Лого) */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-amber-400 mb-2">
            <Sparkles size={18} />
            <span className="uppercase tracking-widest text-[10px] font-bold font-sans">
              Astra Recovery
            </span>
          </div>
        </div>

        {isSuccess ? (
          // --- СОСТОЯНИЕ УСПЕХА ---
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl text-white font-['Georgia'] mb-2">Письмо отправлено</h1>
            <p className="text-slate-400 text-sm font-sans leading-relaxed mb-6">
              Мы отправили инструкции по восстановлению пароля на{' '}
              <span className="text-white">{email}</span>.
              <br />
              Пожалуйста, проверьте папку "Спам".
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors font-sans text-sm"
            >
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          // --- ФОРМА ---
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl text-white font-['Georgia']">Забыли пароль?</h1>
              <p className="text-slate-400 text-sm mt-3 font-['Georgia'] italic">
                Введите email, указанный при регистрации, и мы вышлем вам ссылку для сброса.
              </p>
            </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Ошибка */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-sans">
                  {error}
                </div>
              )}

              {/* Кнопка Отправить */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-['Georgia']"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Отправить ссылку'}
              </button>

              {/* Ссылка назад */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-sans"
                >
                  <ArrowLeft size={14} />
                  Вернуться назад
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
