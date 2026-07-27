export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mt-2 min-h-[calc(100vh-6rem)] py-2">
      {children}
    </div>
  );
}
