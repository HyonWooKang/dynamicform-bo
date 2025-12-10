import type { KioskDevice } from '@/types/kiosk';

import { branchRows } from './branches';

const softwareVersions = ['v3.2.5', 'v3.2.2', 'v3.1.9'];
const installDates = ['2023-10-28', '2023-11-12', '2023-12-04', '2024-01-08'];
const maintenanceDates = ['2024-03-12', '2024-02-27', '2024-03-05', '2024-02-15'];
const locationPresets = [
  '입구 오른쪽',
  '카운터 앞',
  '픽업 존 옆',
  '테이블 존 입구',
  '창가 자석 옆',
];
const networkStatuses: KioskDevice['networkStatus'][] = ['정상', '주의', '정상', '점검 필요'];
const campaignSets = [
  ['봄 시즌 라떼 배너', '키오스크 추천 메뉴'],
  ['디카페인 집중 노출', '신규 고객 웰컴 팝업'],
  ['디저트 번들 프로모션'],
  ['모바일 오더 연동 안내', '콜드브루 하이라이트'],
];
const peripheralSets = [
  ['2D 스캐너', 'IC 카드 리더', '영수증 프린터'],
  ['NFC 리더', '현금 모듈', '열전사 프린터'],
  ['RFID 리더', 'IC 카드 리더'],
  ['지문 인식 패드', 'NFC 리더', '무선 키패드'],
];

const formatMac = (index: number) => {
  const octet = (value: number) => value.toString(16).padStart(2, '0').toUpperCase();
  const base = 0x52;
  const blockA = base + (index % 20);
  const blockB = 0x80 + ((index * 7) % 40);
  const blockC = 0xd0 + ((index * 11) % 30);
  return ['D0', 'F2', octet(blockA), octet(blockB), octet(blockC), octet(0x10 + index)].join(
    ':',
  );
};

const buildHeartbeat = (index: number) => {
  const day = 18 + (index % 7);
  const hour = 9 + (index % 8);
  const minute = (12 + (index * 7) % 46).toString().padStart(2, '0');
  return `2024-03-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute}`;
};

export const kioskDevices: KioskDevice[] = branchRows.slice(0, 12).flatMap((branch, branchIdx) => {
  const kioskCount = branchIdx % 3 === 0 ? 2 : 1;

  return Array.from({ length: kioskCount }, (_, kioskIdx) => {
    const globalIdx = branchIdx * 2 + kioskIdx;
    const suffix = (kioskIdx + 1).toString().padStart(2, '0');
    const usageSeed = branchIdx * 13 + kioskIdx * 7;

    return {
      id: `KS-${branch.id}-${suffix}`,
      kioskName: `${branch.branch} #${suffix}`,
      branchId: branch.id,
      branchName: branch.branch,
      serialNumber: `SC-${(2403200 + globalIdx).toString()}`,
      macAddress: formatMac(globalIdx),
      powerStatus: globalIdx % 7 === 0 ? 'off' : 'on',
      softwareVersion: softwareVersions[(branchIdx + kioskIdx) % softwareVersions.length],
      installedAt: installDates[(branchIdx + kioskIdx) % installDates.length],
      lastMaintenance: maintenanceDates[(branchIdx + kioskIdx) % maintenanceDates.length],
      lastHeartbeat: buildHeartbeat(globalIdx),
      location: locationPresets[(branchIdx + kioskIdx) % locationPresets.length],
      networkStatus: networkStatuses[(branchIdx + kioskIdx) % networkStatuses.length],
      cpuUsage: 32 + (usageSeed % 38),
      memoryUsage: 44 + ((usageSeed * 2) % 32),
      diskUsage: 48 + ((usageSeed * 3) % 28),
      temperature: 26 + ((usageSeed * 5) % 7),
      uptimeHours: 120 + ((usageSeed * 4) % 160),
      activeCampaigns: campaignSets[(branchIdx + kioskIdx) % campaignSets.length],
      peripherals: peripheralSets[(branchIdx + kioskIdx) % peripheralSets.length],
      notes:
        globalIdx % 5 === 0
          ? '터치 패널 민감도 점검 예정 · 정상 운영에는 영향 없음'
          : undefined,
    };
  });
});
