// components/RichText.tsx
import React, { Fragment, JSX } from 'react'
import Link from 'next/link'
import escapeHTML from 'escape-html'

// Битовые маски для форматирования текста в Lexical
const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4
const IS_SUBSCRIPT = 1 << 5
const IS_SUPERSCRIPT = 1 << 6

interface RichTextProps {
  content: any
  className?: string
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '' }) => {
  if (!content || !content.root || !content.root.children) {
    return null
  }

  return <div className={`rich-text ${className}`}>{serialize(content.root.children)}</div>
}

// Функция сериализации (превращает узлы JSON в React элементы)
function serialize(children: any[]): React.ReactNode[] {
  return children.map((node, i) => {
    if (node.type === 'text') {
      // Обработка простого текста с форматированием
      let text = <span key={i} dangerouslySetInnerHTML={{ __html: escapeHTML(node.text) }} />

      if (node.format & IS_BOLD) {
        text = (
          <strong key={i} className="font-bold text-white">
            {text}
          </strong>
        )
      }
      if (node.format & IS_ITALIC) {
        text = (
          <em key={i} className="italic">
            {text}
          </em>
        )
      }
      if (node.format & IS_STRIKETHROUGH) {
        text = (
          <span key={i} className="line-through">
            {text}
          </span>
        )
      }
      if (node.format & IS_UNDERLINE) {
        text = (
          <span key={i} className="underline">
            {text}
          </span>
        )
      }
      if (node.format & IS_CODE) {
        text = (
          <code
            key={i}
            className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono text-sm"
          >
            {text}
          </code>
        )
      }

      return <Fragment key={i}>{text}</Fragment>
    }

    if (!node) {
      return null
    }

    switch (node.type) {
      case 'heading':
        // Заголовки (h1-h6)
        const Tag = node.tag as keyof JSX.IntrinsicElements
        const sizes: Record<string, string> = {
          h1: 'text-3xl font-serif text-white mt-6 mb-4',
          h2: 'text-2xl font-serif text-white mt-5 mb-3',
          h3: 'text-xl font-serif text-white mt-4 mb-2',
          h4: 'text-lg font-bold text-white mt-3 mb-2',
          h5: 'text-base font-bold text-white mt-2 mb-1',
          h6: 'text-sm font-bold text-white mt-2 mb-1',
        }
        return (
          <Tag key={i} className={`${sizes[node.tag]} leading-tight`}>
            {serialize(node.children)}
          </Tag>
        )

      case 'paragraph':
        // Обычный параграф
        return (
          <p key={i} className="mb-4 text-slate-300 leading-relaxed">
            {serialize(node.children)}
          </p>
        )

      case 'list':
        // Списки (ul/ol)
        const ListTag = node.tag as 'ul' | 'ol'
        return (
          <ListTag
            key={i}
            className={`mb-4 pl-6 text-slate-300 ${
              ListTag === 'ol' ? 'list-decimal' : 'list-disc'
            }`}
          >
            {serialize(node.children)}
          </ListTag>
        )

      case 'listitem':
        // Элемент списка
        return (
          <li key={i} className="mb-1 pl-1 marker:text-amber-500">
            {serialize(node.children)}
          </li>
        )

      case 'quote':
        // Цитата
        return (
          <blockquote
            key={i}
            className="border-l-4 border-amber-500 pl-4 py-1 my-4 text-slate-400 italic bg-slate-900/50 rounded-r-lg"
          >
            {serialize(node.children)}
          </blockquote>
        )

      case 'link':
        // Ссылки
        // node.fields.url содержит адрес
        return (
          <Link
            key={i}
            href={escapeHTML(node.fields?.url || '#')}
            target={node.fields?.newTab ? '_blank' : '_self'}
            className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400"
          >
            {serialize(node.children)}
          </Link>
        )

      // Можно добавить блоки для upload (картинок внутри текста), horizontal-rule и т.д.

      default:
        // Если тип не распознан, просто рендерим детей
        return <Fragment key={i}>{serialize(node.children)}</Fragment>
    }
  })
}
