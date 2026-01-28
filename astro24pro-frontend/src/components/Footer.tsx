import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Колонка 1: Бренд и описание */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-indigo-400 font-bold tracking-wide">
              ASTROTOP.PRO
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Профессиональные онлайн консультации с астрологами и тарологами. Получите ответы на
              важные вопросы жизни.
            </p>
          </div>

          {/* Колонка 2: Услуги */}
          <div>
            <h4 className="text-lg font-serif text-white mb-6">Услуги</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services/consultation"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Астрологические консультации
                </Link>
              </li>
              <li>
                <Link
                  href="/services/taro"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Таро-чтения
                </Link>
              </li>
              <li>
                <Link
                  href="/services/natal-chart"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Натальные карты
                </Link>
              </li>
              <li>
                <Link
                  href="/services/forecasts"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Прогнозы и предсказания
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Контакты */}
          <div>
            <h4 className="text-lg font-serif text-white mb-6">Контакты</h4>
            <ul className="space-y-3 text-slate-400">
              <li>
                Email:{' '}
                <a
                  href="mailto:info@astro-consult.ru"
                  className="hover:text-white transition-colors"
                >
                  info@astro-consult.ru
                </a>
              </li>
              <li>
                Телефон:{' '}
                <a href="tel:+79991234567" className="hover:text-white transition-colors">
                  +7 (999) 123-45-67
                </a>
              </li>
              <li>Время работы: 24/7</li>
            </ul>
          </div>

          {/* Колонка 4: Поддержка */}
          <div>
            <h4 className="text-lg font-serif text-white mb-6">Поддержка</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Помощь клиентам
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Техническая поддержка
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-amber-200 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-400 hover:text-amber-200 transition-colors"
                >
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-white/5 pt-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} astrotop.pro. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
