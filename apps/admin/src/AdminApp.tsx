import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PetsListPage } from './pages/PetsListPage';
import { PetDetailPage } from './pages/PetDetailPage';
import { AiTasksListPage } from './pages/AiTasksListPage';
import { AiTaskDetailPage } from './pages/AiTaskDetailPage';

/**
 * Admin Console 根组件，承载侧边导航和路由出口。
 *
 * 前置条件：已由 BrowserRouter 包裹。后置条件：渲染侧边栏和当前路由页面。
 */
export function AdminApp() {
  return (
    <main className="admin-shell" aria-label="Project Momo admin console">
      <Sidebar />
      <section className="workspace">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pets" element={<PetsListPage />} />
          <Route path="/pets/:petId" element={<PetDetailPage />} />
          <Route path="/ai-tasks" element={<AiTasksListPage />} />
          <Route path="/ai-tasks/:taskId" element={<AiTaskDetailPage />} />
        </Routes>
      </section>
    </main>
  );
}
