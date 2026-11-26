import React from 'react';

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  progressPercent: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  completedCount,
  progressPercent,
}) => {
  // 오늘 날짜 한국어 포맷
  const todayFormatted = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <header className="app-header">
      <div className="header-top">
        <h1 className="header-title">꼭 해야 할 일</h1>
        <time className="header-date" dateTime={new Date().toISOString().split('T')[0]}>
          {todayFormatted}
        </time>
      </div>
      <p className="header-subtitle">작은 실천으로 채우는 하루</p>

      <section className="progress-section" aria-label="할 일 진행 현황">
        <div className="progress-info">
          <span>
            전체 {totalCount}개 중 {completedCount}개 완료
          </span>
          <span aria-hidden="true">{progressPercent}%</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`할 일 진행률 ${progressPercent}%`}
        >
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>
    </header>
  );
};
