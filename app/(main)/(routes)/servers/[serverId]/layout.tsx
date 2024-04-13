import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { ServerSidebar } from '@/components/server/server-sidebar';
import { getProfile, getServerByProfileId } from '@/db/queries';
import { Suspense } from 'react';
import Loading from '@/components/loading';

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
      <div className="h-full">
        <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
          <ServerSidebar serverId={params.serverId} />
        </div>
        <main className="h-full md:pl-60">{children}</main>
      </div>
    </Suspense>
  );
};

export default ServerIdLayout;
