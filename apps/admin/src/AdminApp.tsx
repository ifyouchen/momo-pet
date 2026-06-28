import { Activity, Bot, Database, ListChecks } from 'lucide-react';

const metricCards = [
  { label: 'Pets', value: '0', helper: '等待 Sprint 1 接入', icon: Bot },
  { label: 'AI Tasks', value: '0', helper: '等待 Sprint 5 接入', icon: Activity },
  { label: 'Care Events', value: '0', helper: '等待 Sprint 1 接入', icon: ListChecks },
  { label: 'Storage Assets', value: '0', helper: '等待 Sprint 5 接入', icon: Database },
];

/**
 * 后台 Sprint 0 空页面，作为后续排障和验收工具的布局基线。
 *
 * <p>前置条件：React 根节点存在。后置条件：展示 Dashboard、Pets、AI Tasks 三个 MVP 后台入口。
 * 本组件不发起网络请求，不抛出业务异常。</p>
 */
export function AdminApp() {
  return (
    <main className="admin-shell" aria-label="Project Momo admin console">
      <aside className="sidebar">
        <strong>Project Momo</strong>
        <nav aria-label="Admin navigation">
          <a href="#dashboard">Dashboard</a>
          <a href="#pets">Pets</a>
          <a href="#ai-tasks">AI Tasks</a>
        </nav>
      </aside>
      <section className="workspace">
        <header className="page-header">
          <div>
            <h1>Admin Console</h1>
            <p>内部验收与排障工具，Sprint 0 仅提供基础布局。</p>
          </div>
          <span className="environment">Local</span>
        </header>
        <section className="metrics" aria-label="MVP metrics">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="metric-card" key={card.label}>
                <Icon size={20} aria-hidden="true" />
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.helper}</small>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
