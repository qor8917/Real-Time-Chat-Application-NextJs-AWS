import Loading from '@/components/loading';
import { NavigationSidebar } from '@/components/navigation/navigation-sidebar';
import { Suspense } from 'react';
const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="h-full">
        <main className=" h-full">{children}</main>
      </div>
    </Suspense>
  );
};

export default MainLayout;
