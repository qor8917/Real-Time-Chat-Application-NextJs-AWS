import { currentUser, redirectToSignIn } from '@clerk/nextjs';

const ServerPage = async () => {
  const user = await currentUser();
  if (!user) {
    return redirectToSignIn();
  }

  return <div>서버페이지</div>;
};

export default ServerPage;
