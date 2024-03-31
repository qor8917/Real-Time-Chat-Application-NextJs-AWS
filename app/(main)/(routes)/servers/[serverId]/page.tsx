import { getInitialChannelByServerId, getProfile } from '@/db/queries';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const profile = await getProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await getInitialChannelByServerId(params.serverId);

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== 'general') {
    return null;
  }

  return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`);
};

export default ServerIdPage;
