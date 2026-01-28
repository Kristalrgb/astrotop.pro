// components/ReviewCard.tsx
import React from 'react'
import Image from 'next/image'
import { Star, Quote } from 'lucide-react'

export interface ReviewData {
  id: number | string
  clientName: string
  city?: string
  serviceName: string // Какую услугу заказывали
  text: string
  rating: number // 1-5
  avatarUrl?: string // Опционально
}

interface ReviewCardProps {
  data: ReviewData
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ data }) => {
  const { clientName, city, serviceName, text, rating, avatarUrl } = data;

  return (
    <div className="relative h-full bg-slate-950 p-8 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all duration-300 flex flex-col">

      <div className="absolute top-6 left-6 text-amber-500/10">
        <Quote size={48} className="fill-current rotate-180" />
      </div>

      {/* --- ИЗМЕНЕНИЯ ЗДЕСЬ --- */}
      {/* Увеличили gap между звездами (gap-2) */}
      <div className="relative z-10 flex gap-1.5 mb-5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20} /* Было 14, стало 20 - заметно крупнее */
            className={`${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-800'}`}
          />
        ))}
      </div>
      {/* ----------------------- */}

      <p className="relative z-10 text-slate-300 italic mb-6 leading-relaxed flex-grow text-lg">
        "{text}"
      </p>

      {/* Футер карточки (без изменений) */}
      <div className="relative z-10 flex items-center gap-4 pt-4 border-t border-white/5 mt-auto">
        <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center border border-white/10">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={clientName}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-amber-200 font-serif font-bold text-lg">
              {clientName.charAt(0)}
            </span>
          )}
        </div>

        <div>
          <p className="text-white font-medium font-serif">{clientName}</p>
          <div className="flex flex-col md:flex-row md:items-center gap-1 text-xs text-slate-500">
             <span>{city}</span>
             <span className="hidden md:inline text-slate-700">•</span>
             <span className="text-amber-500/80">{serviceName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};