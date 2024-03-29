import { createProfile, getProfile } from '@/db/quieries';
import { currentUser, redirectToSignIn } from '@clerk/nextjs';

const initialProfile = async () => {
  const user = await currentUser();
  if (!user) {
    return redirectToSignIn();
  }
  //프로필 있는지 디비에서 확인
  const profile = await getProfile();
  //있으면 프로필 리턴
  if (profile) {
    return profile;
  }
  //없으면 새로만들어서 리턴
  const newProfile = await createProfile(user);
  return newProfile;
};

export default initialProfile;
