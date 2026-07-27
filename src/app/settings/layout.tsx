export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -mt-2 min-h-[calc(100vh-6rem)] bg-[#0e1621] px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {children}
    </div>
  );
}
