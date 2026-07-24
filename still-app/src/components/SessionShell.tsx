export function SessionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="still-app-container" style={{ background: '#060812', color: 'white' }}>
      <div className="flex-1 flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {children}
      </div>
    </div>
  );
}
