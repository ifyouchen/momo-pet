interface AiAnalysisScreenProps {
  readonly flowMessage: string | null;
  readonly isAnalyzing: boolean;
  readonly onRetry: () => void;
  readonly onManual: () => void;
  readonly onBack: () => void;
}

export function AiAnalysisScreen({
  flowMessage,
  isAnalyzing,
  onRetry,
  onManual,
  onBack,
}: AiAnalysisScreenProps) {
  return (
    <div className="onboarding-screen ai-analysis-screen">
      {!isAnalyzing && flowMessage ? (
        <>
          <h1>分析失败</h1>
          <p className="onboarding-error">{flowMessage}</p>
          <div className="onboarding-actions">
            <button type="button" onClick={onBack}>
              返回上传
            </button>
            <button type="button" onClick={onRetry}>
              重试
            </button>
            <button type="button" onClick={onManual}>
              手动填写
            </button>
          </div>
        </>
      ) : (
        <>
          <h1>AI 分析中</h1>
          <p>正在分析宠物照片，请稍候...</p>
          <div className="onboarding-actions">
            <button type="button" onClick={onBack}>
              取消并返回上传
            </button>
          </div>
        </>
      )}
    </div>
  );
}
