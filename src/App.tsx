import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.tsx';
import { RequireAuth, SuperOnly } from './components/RequireAuth.tsx';
import { SessionBootstrap } from './components/SessionBootstrap.tsx';
import { CampaignsPage } from './pages/CampaignsPage.tsx';
import { ChatsPage } from './pages/ChatsPage.tsx';
import { CompaniesPage } from './pages/CompaniesPage.tsx';
import { ContactsPage } from './pages/ContactsPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { TeamPage } from './pages/TeamPage.tsx';
import { TemplatesPage } from './pages/TemplatesPage.tsx';
import { WalletPage } from './pages/WalletPage.tsx';
import { ActivityPage } from './pages/ActivityPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-full min-h-0 flex-col">
        <SessionBootstrap />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route element={<SuperOnly />}>
              <Route path="companies" element={<CompaniesPage />} />
            </Route>
            <Route path="team" element={<TeamPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="chats" element={<ChatsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
