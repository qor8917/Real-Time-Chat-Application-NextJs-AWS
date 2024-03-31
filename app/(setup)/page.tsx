import InitialModal from '@/components/modals/initial-modal';
import { getServerByProfileId } from '@/db/queries';
import initialProfile from '@/lib/initial-profile';
import { redirect } from 'next/navigation';

const SetupPage = async () => {
  const profile = await initialProfile();
  //프로필 아이디로 서버 있는지 확인 있으면 리다이렉트
  const server = await getServerByProfileId(profile.id);

  if (server) {
    return redirect(`/servers/${server.id}`);
  }
  //없으면 초기 서버 모달창 보여줌
  return <InitialModal />;
};

export default SetupPage;
