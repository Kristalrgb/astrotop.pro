import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ru')

  const translations = {
    ru: {
      // Общие
      common: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успешно',
        cancel: 'Отмена',
        save: 'Сохранить',
        edit: 'Редактировать',
        delete: 'Удалить',
        back: 'Назад',
        next: 'Далее',
        submit: 'Отправить',
        minutes: 'мин'
      },
      // Подвал
      footer: {
        brand: {
          title: 'astrotop.pro',
          description: 'Профессиональные онлайн консультации с астрологами и тарологами. Получите ответы на важные вопросы жизни.'
        },
        services: {
          title: 'Услуги',
          items: [
            'Астрологические консультации',
            'Таро-чтения',
            'Натальные карты',
            'Прогнозы и предсказания'
          ]
        },
        contacts: {
          title: 'Контакты',
          email: 'Email: info@astro-consult.ru',
          phone: 'Телефон: +7 (999) 123-45-67',
          schedule: 'Время работы: 24/7'
        },
        support: {
          title: 'Поддержка',
          help: 'Помощь клиентам',
          tech: 'Техническая поддержка',
          faq: 'FAQ',
          privacy: 'Политика конфиденциальности'
        },
        copyright: '© 2024 astrotop.pro. Все права защищены.'
      },
      // Подвал
      footer: {
        brand: {
          title: 'astrotop.pro',
          description: 'Профессиональные онлайн консультации с астрологами и тарологами. Получите ответы на важные вопросы жизни.'
        },
        services: {
          title: 'Услуги',
          items: [
            'Астрологические консультации',
            'Таро-чтения',
            'Натальные карты',
            'Прогнозы и предсказания'
          ]
        },
        contacts: {
          title: 'Контакты',
          email: 'Email: info@astro-consult.ru',
          phone: 'Телефон: +7 (999) 123-45-67',
          schedule: 'Время работы: 24/7'
        },
        support: {
          title: 'Поддержка',
          help: 'Помощь клиентам',
          tech: 'Техническая поддержка',
          faq: 'FAQ',
          privacy: 'Политика конфиденциальности'
        },
        copyright: '© 2024 astrotop.pro. Все права защищены.'
      },
      // Навигация
      navigation: {
        home: 'Главная',
        specialists: 'Специалисты',
        store: 'Магазин',
        school: 'Школа',
        consultations: 'Консультации',
        profile: 'Профиль',
        login: 'Войти',
        register: 'Регистрация',
        logout: 'Выйти',
        dashboard: 'Личный кабинет',
        astrologerDashboard: 'Кабинет астролога'
      },
      // Главная страница
      home: {
        title: 'astrotop.pro',
        subtitle: 'Онлайн консультации астрологов и тарологов',
        hero: {
          title: 'Получите профессиональную консультацию',
          subtitle: 'От опытных астрологов и тарологов в удобное для вас время',
          cta: 'Начать консультацию'
        },
        features: {
          title: 'Почему выбирают нас',
          items: [
            {
              key: 'video',
              title: 'Видео консультации',
              description: 'Личное общение с астрологом в режиме реального времени'
            },
            {
              key: 'audio',
              title: 'Аудио консультации',
              description: 'Консультации по телефону или аудио чату'
            },
            {
              key: 'schedule',
              title: 'Удобное время',
              description: 'Выбирайте удобное для вас время консультации'
            },
            {
              key: 'group',
              title: 'Групповые сессии',
              description: 'Консультации с несколькими специалистами одновременно'
            },
            {
              key: 'payPerMinute',
              title: 'Поминутная оплата',
              description: 'Платите только за фактическое время консультации'
            },
            {
              key: 'onlineSpecialists',
              title: 'Специалисты Online',
              description: 'Все наши специалисты доступны для консультаций в режиме онлайн'
            }
          ]
        },
        buttons: {
          chooseSpecialist: 'Выбрать специалиста',
          register: 'Зарегистрироваться',
          startNow: 'Начать сейчас'
        },
        topSpecialists: {
          title: 'Топ специалисты',
          book: 'Записаться',
          viewAll: 'Посмотреть всех специалистов'
        },
        ctaSection: {
          title: 'Готовы получить консультацию?',
          description: 'Присоединяйтесь к тысячам довольных клиентов, которые уже получили ответы на свои вопросы',
          button: 'Начать сейчас'
        },
        description: 'Современная платформа для онлайн консультаций с опытными астрологами и тарологами. Получите профессиональную помощь в удобное для вас время.'
      },
      // Специалисты
      specialists: {
        title: 'Наши специалисты',
        rating: 'Рейтинг',
        experience: 'Опыт',
        price: 'Цена',
        reviews: 'Отзывы',
        book: 'Забронировать',
        filter: 'Фильтр',
        search: 'Поиск по имени или специализации...',
        specialty: 'Специализация',
        allSpecialties: 'Все специализации',
        sort: 'Сортировка',
        byRating: 'По рейтингу',
        byPrice: 'По цене',
        byExperience: 'По опыту',
        byReviews: 'По количеству отзывов',
        notFound: 'Специалисты не найдены',
        tryChangeFilters: 'Попробуйте изменить параметры поиска или фильтры',
        pricePerMinute: 'Цена за минуту',
        consultations: 'консультаций',
        years: 'лет'
      },
      // Оплата
      payment: {
        title: 'Оплата консультации',
        amount: 'Сумма',
        currency: 'Валюта',
        method: 'Способ оплаты',
        card: 'Банковская карта',
        crypto: 'Криптовалюта',
        process: 'Обработать платеж',
        success: 'Платеж успешен',
        error: 'Ошибка платежа',
        cardNumber: 'Номер карты',
        expiry: 'Срок действия',
        cvv: 'CVV',
        cardholderName: 'Имя владельца',
        cryptoAddress: 'Адрес кошелька',
        cryptoInfo: 'Отправьте указанную сумму на указанный адрес кошелька',
        sendTo: 'Отправить на'
      },
      // Консультации
      consultation: {
        title: 'Консультация',
        duration: 'Длительность',
        price: 'Цена',
        specialist: 'Специалист',
        date: 'Дата',
        time: 'Время',
        status: 'Статус',
        start: 'Начать',
        join: 'Присоединиться',
        participants: 'участников',
        minutes: 'мин'
      },
      // Магазин аксессуаров
      store: {
        title: 'Магазин аксессуаров',
        subtitle: 'Качественные товары для астрологов, тарологов и эзотериков',
        searchPlaceholder: 'Поиск товаров...',
        sortByName: 'По названию',
        sortByPrice: 'По цене',
        sortByRating: 'По рейтингу',
        sortByReviews: 'По отзывам',
        addToCart: 'В корзину',
        outOfStock: 'Нет в наличии',
        noProducts: 'Товары не найдены',
        cartItems: 'Товаров в корзине',
        checkout: 'Оформить заказ',
        reviews: 'отзывов',
        language: 'ru'
      },
      // Школа
      school: {
        title: 'Школа',
        subtitle: 'Обучающие лекции от опытных астрологов',
        searchPlaceholder: 'Поиск лекций...',
        sortByRating: 'По рейтингу',
        sortByPrice: 'По цене',
        sortByTitle: 'По названию',
        sortByReviews: 'По отзывам',
        sortByDuration: 'По длительности',
        buy: 'Купить',
        watch: 'Смотреть',
        reviews: 'отзывов',
        noLectures: 'Лекции не найдены',
        loading: 'Загрузка лекций...',
        error: 'Ошибка',
        cart: 'Корзина',
        total: 'Итого',
        checkout: 'Оформить заказ',
        checkoutMessage: 'Заказ успешно оформлен! Лекции добавлены в вашу библиотеку.'
      },
      // Регистрация
      register: {
        title: 'Регистрация',
        subtitle: 'Создайте аккаунт для доступа к консультациям',
        fullName: 'Полное имя',
        email: 'Email',
        phone: 'Телефон (необязательно)',
        profilePhoto: 'Фото профиля (необязательно)',
        accountType: 'Тип аккаунта',
        client: 'Клиент - получать консультации',
        astrologer: 'Астролог/Таролог - проводить консультации',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        register: 'Зарегистрироваться',
        registering: 'Регистрация...',
        alreadyHaveAccount: 'Уже есть аккаунт?',
        login: 'Войти',
        benefits: 'Преимущества регистрации:',
        benefitsList: [
          'Доступ к личному кабинету',
          'Запись на консультации',
          'История консультаций',
          'Скачивание записей',
          'Персональные рекомендации'
        ],
        errors: {
          passwordsNotMatch: 'Пароли не совпадают',
          passwordTooShort: 'Пароль должен содержать минимум 6 символов',
          nameRequired: 'Введите ваше имя',
          emailRequired: 'Введите email',
          registrationError: 'Произошла ошибка при регистрации'
                 }
       },
       // Профиль
       profile: {
         title: 'Профиль',
         subtitle: 'Управление личной информацией и настройками',
         editProfile: 'Редактировать профиль',
         saveChanges: 'Сохранить изменения',
         cancel: 'Отмена',
         personalInfo: 'Личная информация',
         contactInfo: 'Контактная информация',
         notLoggedIn: 'Пожалуйста, войдите в систему для просмотра профиля',
         saveSuccess: 'Профиль успешно обновлен',
         saveError: 'Ошибка при сохранении профиля',
         imageUpload: {
           title: 'Загрузить фото профиля',
           description: 'Перетащите изображение сюда или нажмите для выбора файла',
           hint: 'Нажмите для выбора файла',
           changePhoto: 'Изменить фото',
           preview: 'Предварительный просмотр',
           supportedFormats: 'Поддерживаемые форматы: JPG, PNG, GIF',
           maxSize: 'Максимальный размер: {maxSize} МБ',
           errors: {
             invalidType: 'Пожалуйста, выберите изображение',
             tooLarge: 'Размер файла не должен превышать {maxSize} МБ'
           }
         }
       }
     },
    en: {
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        minutes: 'min'
      },
      // Navigation
      navigation: {
        home: 'Home',
        specialists: 'Specialists',
        store: 'Store',
        school: 'School',
        consultations: 'Consultations',
        profile: 'Profile',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        dashboard: 'Dashboard',
        astrologerDashboard: 'Astrologer Dashboard'
      },
      // Home page
      home: {
        title: 'Astro Consultations',
        subtitle: 'Online consultations with astrologers and tarologists',
        hero: {
          title: 'Get professional consultation',
          subtitle: 'From experienced astrologers and tarologists at your convenient time',
          cta: 'Start consultation'
        },
        features: {
          title: 'Why choose us',
          items: [
            {
              key: 'video',
              title: 'Video consultations',
              description: 'Live sessions with an astrologer in real time'
            },
            {
              key: 'audio',
              title: 'Audio consultations',
              description: 'Consultations by phone or audio chat'
            },
            {
              key: 'schedule',
              title: 'Convenient time',
              description: 'Choose the consultation time that suits you'
            },
            {
              key: 'group',
              title: 'Group sessions',
              description: 'Consultations with several specialists at once'
            },
            {
              key: 'payPerMinute',
              title: 'Pay per minute',
              description: 'Pay only for the actual consultation time'
            },
            {
              key: 'onlineSpecialists',
              title: 'Specialists Online',
              description: 'All our specialists are available for online sessions'
            }
          ]
        },
        buttons: {
          chooseSpecialist: 'Choose a specialist',
          register: 'Register',
          startNow: 'Start now'
        },
        topSpecialists: {
          title: 'Top specialists',
          book: 'Book now',
          viewAll: 'View all specialists'
        },
        ctaSection: {
          title: 'Ready to get a consultation?',
          description: 'Join thousands of satisfied clients who have already received answers to their questions',
          button: 'Start now'
        },
        description: 'Modern platform for online consultations with experienced astrologers and tarologists. Get professional help at your convenient time.'
      },
      // Specialists
      specialists: {
        title: 'Our specialists',
        rating: 'Rating',
        experience: 'Experience',
        price: 'Price',
        reviews: 'Reviews',
        book: 'Book',
        filter: 'Filter',
        search: 'Search by name or specialty...',
        specialty: 'Specialty',
        allSpecialties: 'All specialties',
        sort: 'Sort',
        byRating: 'By rating',
        byPrice: 'By price',
        byExperience: 'By experience',
        byReviews: 'By number of reviews',
        notFound: 'Specialists not found',
        tryChangeFilters: 'Try changing search parameters or filters',
        pricePerMinute: 'Price per minute',
        consultations: 'consultations',
        years: 'years'
      },
      // Payment
      payment: {
        title: 'Consultation payment',
        amount: 'Amount',
        currency: 'Currency',
        method: 'Payment method',
        card: 'Bank card',
        crypto: 'Cryptocurrency',
        process: 'Process payment',
        success: 'Payment successful',
        error: 'Payment error',
        cardNumber: 'Card number',
        expiry: 'Expiry date',
        cvv: 'CVV',
        cardholderName: 'Cardholder name',
        cryptoAddress: 'Wallet address',
        cryptoInfo: 'Send the specified amount to the specified wallet address',
        sendTo: 'Send to'
      },
      // Consultation
      consultation: {
        title: 'Consultation',
        duration: 'Duration',
        price: 'Price',
        specialist: 'Specialist',
        date: 'Date',
        time: 'Time',
        status: 'Status',
        start: 'Start',
        join: 'Join',
        participants: 'participants',
        minutes: 'min'
      },
      // Accessories Store
      store: {
        title: 'Accessories Store',
        subtitle: 'Quality products for astrologers, tarologists and esotericists',
        searchPlaceholder: 'Search products...',
        sortByName: 'By name',
        sortByPrice: 'By price',
        sortByRating: 'By rating',
        sortByReviews: 'By reviews',
        addToCart: 'Add to cart',
        outOfStock: 'Out of stock',
        noProducts: 'Products not found',
        cartItems: 'Items in cart',
        checkout: 'Checkout',
        reviews: 'reviews',
        language: 'en'
      },
      // School
      school: {
        title: 'School',
        subtitle: 'Educational lectures from experienced astrologers',
        searchPlaceholder: 'Search lectures...',
        sortByRating: 'By rating',
        sortByPrice: 'By price',
        sortByTitle: 'By title',
        sortByReviews: 'By reviews',
        sortByDuration: 'By duration',
        buy: 'Buy',
        watch: 'Watch',
        reviews: 'reviews',
        noLectures: 'Lectures not found',
        loading: 'Loading lectures...',
        error: 'Error',
        cart: 'Cart',
        total: 'Total',
        checkout: 'Checkout',
        checkoutMessage: 'Order completed successfully! Lectures have been added to your library.'
      },
      // Footer
      footer: {
        brand: {
          title: 'astrotop.pro',
          description: 'Professional online consultations with astrologers and tarologists. Get answers to the important questions of life.'
        },
        services: {
          title: 'Services',
          items: [
            'Astrological consultations',
            'Tarot readings',
            'Natal charts',
            'Forecasts and predictions'
          ]
        },
        contacts: {
          title: 'Contacts',
          email: 'Email: info@astro-consult.ru',
          phone: 'Phone: +7 (999) 123-45-67',
          schedule: 'Working hours: 24/7'
        },
        support: {
          title: 'Support',
          help: 'Customer help',
          tech: 'Technical support',
          faq: 'FAQ',
          privacy: 'Privacy policy'
        },
        copyright: '© 2024 astrotop.pro. All rights reserved.'
      },
      // Registration
      register: {
        title: 'Registration',
        subtitle: 'Create an account to access consultations',
        fullName: 'Full name',
        email: 'Email',
        phone: 'Phone (optional)',
        profilePhoto: 'Profile Photo (optional)',
        accountType: 'Account type',
        client: 'Client - receive consultations',
        astrologer: 'Astrologer/Tarologist - conduct consultations',
        password: 'Password',
        confirmPassword: 'Confirm password',
        register: 'Register',
        registering: 'Registering...',
        alreadyHaveAccount: 'Already have an account?',
        login: 'Login',
        benefits: 'Registration benefits:',
        benefitsList: [
          'Access to personal account',
          'Book consultations',
          'Consultation history',
          'Download recordings',
          'Personal recommendations'
        ],
        errors: {
          passwordsNotMatch: 'Passwords do not match',
          passwordTooShort: 'Password must be at least 6 characters',
          nameRequired: 'Enter your name',
          emailRequired: 'Enter email',
          registrationError: 'Registration error occurred'
        }
      },
             // Profile
       profile: {
         title: 'Profile',
         subtitle: 'Manage personal information and settings',
         editProfile: 'Edit Profile',
         saveChanges: 'Save Changes',
         cancel: 'Cancel',
         personalInfo: 'Personal Information',
         contactInfo: 'Contact Information',
         notLoggedIn: 'Please log in to view your profile',
         saveSuccess: 'Profile updated successfully',
         saveError: 'Error saving profile',
        imageUpload: {
          title: 'Upload Profile Photo',
          description: 'Drag and drop an image here or click to select a file',
          hint: 'Click to select file',
          changePhoto: 'Change Photo',
          preview: 'Preview',
          supportedFormats: 'Supported formats: JPG, PNG, GIF',
          maxSize: 'Maximum size: {maxSize} MB',
          errors: {
            invalidType: 'Please select an image',
            tooLarge: 'File size should not exceed {maxSize} MB'
          }
        }
      }
    }
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[currentLanguage]
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        return key // Возвращаем ключ, если перевод не найден
      }
    }
    
    return value
  }

  const changeLanguage = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem('language', language)
  }

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    translations
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
