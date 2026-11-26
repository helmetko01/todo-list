import React from 'react';

interface SummaryFooterProps {
  remainingCount: number;
  completedCount: number;
  storageError: string | null;
  onOpenClearDialog: () => void;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  remainingCount,
  completedCount,
  storageError,
  onOpenClearDialog,
}) => {
  return (
    <footer className="app-footer">
      <div className="app-footer-top">
        <span className="remaining-count">남은 할 일 {remainingCount}개</span>
        <button
          type="button"
          className="btn btn-destructive"
          disabled={completedCount === 0}
          onClick={onOpenClearDialog}
          aria-label={`완료한 할 일 ${completedCount}개 일괄 삭제`}
        >
          완료 항목 삭제
        </button>
      </div>

      <p
        className={`storage-notice ${storageError ? 'has-error' : ''}`}
        role={storageError ? 'alert' : undefined}
      >
        {storageError ? (
          <>
            <strong>저장 실패:</strong> {storageError}
          </>
        ) : (
          '이 브라우저에 자동 저장됩니다.'
        )}
      </p>
    </footer>
  );
};
