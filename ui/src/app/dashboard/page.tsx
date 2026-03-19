import { Sidebar } from '@/components/sidebar';
import { HomePage } from '@/components/home-page';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <HomePage />
      </main>
    </div>
  );
}
