import { CATEGORY_COLORS, type Category } from '@/lib/types'

interface Props {
  category: Category
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'md' }: Props) {
  const colors = CATEGORY_COLORS[category]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-block font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClass}`}
    >
      {category}
    </span>
  )
}
