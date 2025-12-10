import { useCallback, useMemo, useState } from 'react';

import { createKioskColumns } from '@/columns/kiosk';
import KioskDetailDialog from '@/components/kiosk/KioskDetailDialog';
import DataBoard from '@/components/data-board/DataBoard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useKiosk } from '@/contexts/kiosk';
import type { KioskDevice } from '@/types/kiosk';

const PAGE_SIZE = 8;
const PAGE_WINDOW = 5;

export default function KioskManagementPage() {
  const { kiosks, setPowerStatus } = useKiosk();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return kiosks;

    return kiosks.filter((kiosk) =>
      [
        kiosk.kioskName,
        kiosk.branchName,
        kiosk.serialNumber,
        kiosk.macAddress,
        kiosk.softwareVersion,
        kiosk.location,
      ]
        .join(' ')
        .toLowerCase()
        .includes(value),
    );
  }, [kiosks, keyword]);

  const selectedKiosk = useMemo(
    () => kiosks.find((kiosk) => kiosk.id === selectedId) ?? null,
    [kiosks, selectedId],
  );

  const stats = useMemo(() => {
    const total = kiosks.length;
    const online = kiosks.filter((kiosk) => kiosk.powerStatus === 'on').length;
    const offline = total - online;
    const attention = kiosks.filter((kiosk) => kiosk.networkStatus !== '정상').length;
    return {
      total,
      online,
      offline,
      attention,
    };
  }, [kiosks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const windowStart = Math.floor((safePage - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const windowEnd = Math.min(windowStart + PAGE_WINDOW - 1, totalPages);
  const pageItems = filtered.length
    ? Array.from({ length: windowEnd - windowStart + 1 }, (_, idx) => windowStart + idx)
    : [];

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleSelectKiosk = useCallback((row: KioskDevice) => {
    setSelectedId(row.id);
  }, []);

  const columns = useMemo(
    () => createKioskColumns(handleSelectKiosk),
    [handleSelectKiosk],
  );

  const handleCloseDetail = () => {
    setSelectedId(null);
  };

  const handleRemoteWake = () => {
    if (!selectedKiosk) return;
    setPowerStatus(selectedKiosk.id, 'on');
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-sm font-semibold text-amber-600">디바이스 관리</p>
        <h1 className="text-3xl font-bold text-gray-900">키오스크 관리</h1>
        <p className="text-gray-600">
          지점별로 설치된 키오스크의 전원·SW·네트워크 상태를 확인하고, 필요 시
          원격 점검을 실행하세요.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '등록된 기기', value: stats.total, description: '설치 완료' },
          {
            label: '운영 중',
            value: stats.online,
            description: '전원 ON',
            accent: 'text-emerald-600',
          },
          {
            label: '전원 OFF',
            value: stats.offline,
            description: '확인 필요',
            accent: 'text-red-600',
          },
          {
            label: '네트워크 점검',
            value: stats.attention,
            description: '주의/점검 필요',
            accent: 'text-amber-600',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold text-gray-900 ${card.accent ?? ''}`}>
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </section>

      <DataBoard
        title="키오스크 운영 현황"
        columns={columns}
        data={paged}
        searchPlaceholder="지점명 · Serial · MAC 검색"
        onSearch={handleSearch}
        totalCount={filtered.length}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600">
            {filtered.length > 0
              ? `${filtered.length.toLocaleString()}대 중 ${start + 1}~${Math.min(
                  start + PAGE_SIZE,
                  filtered.length,
                ).toLocaleString()}대를 보고 있습니다.`
              : '조건에 맞는 키오스크가 없습니다.'}
          </p>
          {filtered.length > 0 ? (
            <Pagination className="md:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (safePage > 1) setPage(safePage - 1);
                    }}
                    className={safePage === 1 ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
                {pageItems.map((item) => (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === safePage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (safePage < totalPages) setPage(safePage + 1);
                    }}
                    className={
                      safePage === totalPages ? 'pointer-events-none opacity-50' : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </div>

      <KioskDetailDialog
        kiosk={selectedKiosk}
        onClose={handleCloseDetail}
        onRemoteWake={handleRemoteWake}
      />
    </div>
  );
}

