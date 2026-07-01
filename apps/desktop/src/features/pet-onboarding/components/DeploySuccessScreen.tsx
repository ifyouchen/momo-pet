interface DeploySuccessScreenProps {
  readonly petName: string;
  readonly onFinish: () => void;
  readonly canFinish: boolean;
}

export function DeploySuccessScreen({ petName, onFinish, canFinish }: DeploySuccessScreenProps) {
  return (
    <div className="onboarding-screen deploy-success-screen">
      <h1>领养成功</h1>
      <p>{petName} 已经准备好和你一起生活了。</p>
      <button type="button" onClick={onFinish} disabled={!canFinish}>
        开始互动
      </button>
    </div>
  );
}
