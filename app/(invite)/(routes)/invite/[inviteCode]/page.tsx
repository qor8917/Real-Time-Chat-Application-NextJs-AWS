import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import {
  createMember,
  getProfile,
  getServerByInviteCode,
  getServerByInviteCodeAndIncludeProfile,
} from '@/db/queries';

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const profile = await getProfile();

  if (!profile) {
    return redirectToSignIn();
  }
  if (!params.inviteCode) {
    return redirect('/');
  }

  //choco 에서 latte 서버를 가져오면  choco에 latte 서버가 보여야해
  //만약에 choco 에서 이미 latte 서버를 가지고 있다면 기존에 있는 서버로 리다이렉트
  const existingServer = await getServerByInviteCodeAndIncludeProfile(
    params.inviteCode,
    profile.id
  );

  if (existingServer?.members.length !== 0) {
    return redirect(`/servers/${existingServer?.id}`);
  }

  //latte 서버는 찾을수 있고, latte 서버안에 member에 choco 를 추가해주고
  //나중에는 choco 가 멤버로 들어가 있는 모든 서버를 불러오면됨

  //latte 서버
  const server = await getServerByInviteCode(params.inviteCode);
  //latte 서버에 choco 프로필 없으면 내 프로필(choco)로 멤버 추가
  const alreadyAdded = server?.members.find((member) => {
    member.profileId == profile.id;
  });
  if (!alreadyAdded) {
    const newMember = await createMember(server?.id!, profile.id);
  }

  const updatedServer = await getServerByInviteCode(params.inviteCode);
  if (updatedServer) {
    return redirect(`/servers/${updatedServer.id}`);
  }

  return null;
};

export default InviteCodePage;
