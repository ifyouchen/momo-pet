interface WelcomeScreenProps {
  readonly onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="onboarding-screen welcome-screen">
      <h1>欢迎来到 Momo Pet</h1>
      <p>在这里领养一只属于你的桌面宠物。</p>
      <button type="button" onClick={onStart}>
        开始领养
      </button>
    </div>
  );
}
