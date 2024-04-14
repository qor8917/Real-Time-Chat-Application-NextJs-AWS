import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { ServerSidebar } from '@/components/server/server-sidebar';
import { getProfile, getServerByProfileId } from '@/db/queries';
import { Suspense } from 'react';
import Loading from '@/components/loading';
import { NavigationSidebar } from '@/components/navigation/navigation-sidebar';

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const profile = await getProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await getServerByProfileId(profile.id);

  if (!server) {
    return redirect('/');
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <div className=" md:pl-[72px] h-full">
        <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
          <ServerSidebar serverId={params.serverId} />
        </div>
        <main className="h-full md:pl-60">{children}</main>
      </div>
    </Suspense>
  );
};

export default ServerIdLayout;
