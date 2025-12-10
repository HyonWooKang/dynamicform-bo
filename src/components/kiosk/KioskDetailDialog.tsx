import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { KioskDevice } from '@/types/kiosk';

type KioskDetailDialogProps = {
  kiosk: KioskDevice | null;
  onClose: () => void;
  onRemoteWake?: () => void;
};

export default function KioskDetailDialog({
  kiosk,
  onClose,
  onRemoteWake,
}: KioskDetailDialogProps) {
  return (
    <AlertDialog
      open={Boolean(kiosk)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {kiosk ? (
        <AlertDialogContent className="max-w-3xl rounded-2xl">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-2xl text-gray-900">
              {kiosk.kioskName}
            </AlertDialogTitle>
            <p className="text-sm text-gray-500">
              {kiosk.branchName} · {kiosk.location}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge
                className={
                  kiosk.powerStatus === 'on'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }
              >
                전원 {kiosk.powerStatus === 'on' ? 'ON' : 'OFF'}
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-700">
                SW {kiosk.softwareVersion}
              </Badge>
              <Badge
                className={
                  kiosk.networkStatus === '정상'
                    ? 'bg-sky-100 text-sky-700'
                    : kiosk.networkStatus === '주의'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }
              >
                네트워크 {kiosk.networkStatus}
              </Badge>
            </div>
          </AlertDialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700">기본 정보</h3>
              <dl className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Serial</dt>
                  <dd className="font-mono text-gray-900">{kiosk.serialNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">MAC</dt>
                  <dd className="font-mono text-gray-900">{kiosk.macAddress}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">설치일</dt>
                  <dd className="text-gray-900">{kiosk.installedAt}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">최근 점검</dt>
                  <dd className="text-gray-900">{kiosk.lastMaintenance}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">업타임</dt>
                  <dd className="text-gray-900">
                    {kiosk.uptimeHours.toLocaleString()} 시간
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700">상태 모니터링</h3>
              <dl className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt className="text-gray-500">최근 동기화</dt>
                  <dd className="text-gray-900">{kiosk.lastHeartbeat}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">CPU</dt>
                  <dd className="text-gray-900">{kiosk.cpuUsage}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">메모리</dt>
                  <dd className="text-gray-900">{kiosk.memoryUsage}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">저장공간</dt>
                  <dd className="text-gray-900">{kiosk.diskUsage}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">내부 온도</dt>
                  <dd className="text-gray-900">{kiosk.temperature}℃</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-dashed border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700">운영 콘텐츠 · 주변기기</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-xs text-gray-500">활성 캠페인</p>
              <div className="flex flex-wrap gap-2">
                {kiosk.activeCampaigns.map((campaign) => (
                  <Badge key={campaign} variant="outline" className="text-gray-700">
                    {campaign}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-xs text-gray-500">연결 주변기기</p>
              <ul className="list-disc space-y-1 pl-4">
                {kiosk.peripherals.map((item) => (
                  <li key={item} className="text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {kiosk.notes ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {kiosk.notes}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              닫기
            </Button>
            {onRemoteWake ? (
              <Button
                type="button"
                onClick={onRemoteWake}
                disabled={kiosk.powerStatus === 'on'}
                className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              >
                {kiosk.powerStatus === 'on' ? '정상 가동 중' : '원격 재가동'}
              </Button>
            ) : null}
          </div>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
  );
}

