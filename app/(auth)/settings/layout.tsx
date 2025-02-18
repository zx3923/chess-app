import SettingTabBar from "@/components/setting-tab-bar";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="w-full max-w-[1024px] mx-auto px-4">
        <div className="mt-16 mb-4 gap-2 flex items-center">
          <Cog8ToothIcon className="w-8" />
          <span>설정</span>
        </div>
        <div className="flex gap-4">
          <SettingTabBar />
          {children}
        </div>
      </div>
    </div>
  );
}
