import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMenu } from '@/contexts/menu';
import { useTags } from '@/contexts/tags';

export default function TagSettingsPage() {
  const { tags, addTag, removeTag } = useTags();
  const { menus, removeTagFromMenus } = useMenu();
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  const tagStats = useMemo(
    () =>
      tags
        .map((tag) => ({
          tag,
          count: menus.filter((menu) => menu.tags.includes(tag)).length,
        }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    [menus, tags],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newTag.trim();
    if (!trimmed) {
      setError('태그명을 입력해 주세요.');
      return;
    }
    if (tags.includes(trimmed)) {
      setError('이미 등록된 태그입니다.');
      return;
    }

    addTag(trimmed);
    setNewTag('');
    setError('');
  };

  const handleDelete = (tag: string) => {
    removeTag(tag);
    removeTagFromMenus(tag);
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-sm font-semibold text-amber-600">카테고리 관리</p>
        <h1 className="text-3xl font-bold text-gray-900">카테고리 관리</h1>
        <p className="text-gray-600">
          태그(카테고리)를 추가/삭제하고, 해당 태그와 연결된 메뉴 수량을 확인하세요.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              value={newTag}
              onChange={(event) => {
                setNewTag(event.target.value);
                setError('');
              }}
              placeholder="추가할 태그명을 입력해 주세요."
            />
            <Button type="submit" className="gap-2 md:w-40">
              <Plus className="h-4 w-4" />
              태그 추가
            </Button>
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <p className="text-sm text-gray-500">
            메뉴 등록/수정 시 선택할 수 있도록 사전에 태그를 등록해 두세요.
          </p>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">태그 목록</h2>
            <p className="text-sm text-gray-500">
              총 {tagStats.length.toLocaleString()}개의 태그가 등록되어 있습니다.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">태그명</th>
                <th className="px-6 py-3">연결된 메뉴 수</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tagStats.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                    등록된 태그가 없습니다.
                  </td>
                </tr>
              ) : (
                tagStats.map((item) => (
                  <tr key={item.tag}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{item.tag}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {item.count.toLocaleString()}개
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item.tag)}
                      >
                        <Trash2 className="h-4 w-4" />
                        태그 삭제
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
