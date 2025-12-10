import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import type { DataBoardColumn } from '@/components/data-board/DataBoard';
import type { MenuItem } from '@/types/menu';

export const menuBoardColumns: DataBoardColumn<MenuItem>[] = [
  {
    key: 'name',
    header: '메뉴명',
    render: (row) => (
      <div className="space-y-1">
        <Link
          to={`/menu/${row.id}`}
          state={{ menu: row }}
          className="font-semibold text-indigo-600 hover:underline"
        >
          {row.name}
        </Link>
        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
          <span>{row.releaseDate}</span>
          {row.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    header: '카테고리',
    render: (row) => (
      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
        {row.category}
      </Badge>
    ),
  },
  {
    key: 'price',
    header: '판매가',
    render: (row) => `${row.price.toLocaleString()}원`,
  },
  {
    key: 'availability',
    header: '판매 구분',
    render: (row) => (
      <Badge
        variant={row.availability === '시즌' ? 'outline' : 'default'}
        className={
          row.availability === '시즌'
            ? 'border-orange-200 bg-orange-50 text-orange-700'
            : 'bg-emerald-50 text-emerald-700'
        }
      >
        {row.availability}
      </Badge>
    ),
  },
  {
    key: 'kioskExposure',
    header: '키오스크 노출',
    render: (row) =>
      row.kioskExposure ? (
        <Badge className="bg-blue-50 text-blue-700">노출 중</Badge>
      ) : (
        <Badge variant="outline" className="border-gray-200 text-gray-600">
          숨김
        </Badge>
      ),
  },
];
