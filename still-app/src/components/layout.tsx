import { Link, useRoute } from 'wouter';

export function NavigationShell({ children }: { children: React.ReactNode }) {
  const [isToday] = useRoute('/today');
  const [isWeek] = useRoute('/week');
  const [isBuilding] = useRoute('/building');
  const [isSettings] = useRoute('/settings');

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <nav className="w-full border-t border-border bg-background pb-safe">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around text-sm font-medium">
          <Link href="/today" className={`px-4 py-2 transition-opacity ${isToday ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-today">
            Today
          </Link>
          <Link href="/week" className={`px-4 py-2 transition-opacity ${isWeek ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-week">
            Week
          </Link>
          <Link href="/building" className={`px-4 py-2 transition-opacity ${isBuilding ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="nav-building">
            Building
          </Link>
        </div>
      </nav>
    </div>
  );
}
