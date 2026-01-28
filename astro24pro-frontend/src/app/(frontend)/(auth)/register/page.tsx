'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, Briefcase, Smile } from 'lucide-react'

type UserRole = 'client' | 'specialist'

export default function RegisterPage() {
  const router = useRouter()

  // Состояние роли (по умолчанию Клиент)
  const [role, setRole] = useState<UserRole>('client')

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Простая валидация паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    try {
      // Отправляем запрос на создание пользователя
      // Важно: убедитесь, что в PayloadCMS в коллекции Users разрешен create (public access)
      // и поле role доступно для записи при регистрации.
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          surname: formData.surname,
          role: role, // Передаем выбранную роль
        }),
      })

      const data = await res.json()

      if (res.ok) {
        console.log('Registration success:', data)
        // После регистрации можно сразу логинить или перекидывать на страницу входа
        router.push('/login?registered=true')
      } else {
        // Обработка ошибок от Payload
        setError(data.errors?.[0]?.message || 'Ошибка при регистрации')
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
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_60%_10%,rgba(180,83,9,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- КАРТОЧКА РЕГИСТРАЦИИ --- */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Хедер */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-amber-400 mb-2">
            <Sparkles size={18} />
            <span className="uppercase tracking-widest text-[10px] font-bold font-sans">
              Astra Register
            </span>
          </div>
          <h1 className="text-xl md:text-2xl text-white font-['Georgia'] font-medium">
            Создать аккаунт
          </h1>
        </div>

        {/* --- ПЕРЕКЛЮЧАТЕЛЬ РОЛЕЙ --- */}
        <div className="bg-slate-950/50 p-1.5 rounded-xl border border-white/5 flex mb-6 relative">
          {/* Фон активной вкладки (анимация) */}
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${role === 'client' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
          ></div>

          {/* Кнопка: Клиент */}
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-sans font-medium transition-colors duration-300 ${
              role === 'client' ? 'text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile size={16} />Я Клиент
          </button>

          {/* Кнопка: Специалист */}
          <button
            type="button"
            onClick={() => setRole('specialist')}
            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-sans font-medium transition-colors duration-300 ${
              role === 'specialist' ? 'text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase size={16} />
            Специалист
          </button>
        </div>

        {/* Подсказка о роли */}
        <p className="text-center text-xs text-slate-500 mb-6 -mt-2 italic font-serif">
          {role === 'client'
            ? 'Ищите ответы и заказывайте консультации'
            : 'Предлагайте услуги и находите клиентов'}
        </p>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя и Фамилия (в одну строку) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 ml-1 font-sans">Имя</label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-white text-sm focus:border-amber-400/50 focus:outline-none transition-colors font-sans"
                  placeholder="Иван"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 ml-1 font-sans">Фамилия</label>
              <input
                type="text"
                required
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:border-amber-400/50 focus:outline-none transition-colors font-sans"
                placeholder="Иванов"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1 font-sans">Email</label>
            <div className="relative group">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"
                size={16}
              />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
              />
            </div>
          </div>

          {/* Пароль */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1 font-sans">Пароль</label>
            <div className="relative group">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"
                size={16}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Повтор пароля */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1 font-sans">Подтвердите пароль</label>
            <div className="relative group">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"
                size={16}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full bg-slate-950 border rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all font-sans ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50'
                }`}
              />
            </div>
          </div>

          {/* Ошибки */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-sans">
              {error}
            </div>
          )}

          {/* Кнопка Регистрации */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-['Georgia']"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Зарегистрироваться'}
          </button>

          {/* Ссылка на вход */}
          <div className="text-center pt-2 text-sm font-['Georgia'] text-slate-400">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="text-amber-400 hover:text-amber-300 transition-colors hover:underline underline-offset-4 italic"
            >
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
