export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">대시보드</h1>
      <p className="text-gray-600">
        팀의 주요 지표와 최근 활동을 한눈에 확인할 수 있습니다.
      </p>
      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {['신규 가입자', '전환율', '서비스 가용성'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              준비 중...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
