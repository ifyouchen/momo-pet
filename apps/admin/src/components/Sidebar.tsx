import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pets', label: 'Pets', end: false },
  { to: '/ai-tasks', label: 'AI Tasks', end: false },
];

/**
 * Admin 侧边栏导航。
 *
 * @returns 侧边栏组件
 */
export function Sidebar() {
  return (
    <aside className="sidebar">
      <strong>Project Momo</strong>
      <nav aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
