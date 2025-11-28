import { type ReactNode, useMemo, useState } from 'react';

export type DataBoardColumn<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => ReactNode;
};

export type DataBoardAction<T> = {
  label: string;
  onClick: (row: T) => void;
  variant?: 'primary' | 'ghost';
};

type DataBoardProps<T> = {
  title: string;
  columns: DataBoardColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (keyword: string) => void;
  actions?: DataBoardAction<T>[];
};

export default function DataBoard<T extends Record<string, any>>({
  title,
  columns,
  data,
  searchPlaceholder = '검색어를 입력하세요',
  onSearch,
  actions = [],
}: DataBoardProps<T>) {
  const [keyword, setKeyword] = useState('');

  const filteredData = useMemo(() => {
    if (!keyword) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(keyword.toLowerCase()),
      ),
    );
  }, [data, keyword]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(keyword);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            총 {filteredData.length.toLocaleString()}건이 검색되었습니다.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full gap-2 md:w-auto md:min-w-[280px]"
        >
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            검색
          </button>
        </form>
      </div>

      <div className="overflow-x-auto px-6 py-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-500">
              {columns.map((column) => (
                <th key={String(column.key)} className="px-3 pb-3 font-medium">
                  {column.header}
                </th>
              ))}
              {actions.length > 0 ? <th className="px-3 pb-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((row) => (
              <tr key={String(row.id ?? row[columns[0].key])}>
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-3 py-3 text-gray-700">
                    {column.render ? column.render(row) : String(row[column.key])}
                  </td>
                ))}
                {actions.length > 0 ? (
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => action.onClick(row)}
                          className={`rounded-lg px-3 py-1 text-xs font-medium ${
                            action.variant === 'ghost'
                              ? 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-3 py-10 text-center text-sm text-gray-500"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
