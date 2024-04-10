'use client';

import { Fragment, useRef, ElementRef, useEffect } from 'react';
import { format, fromUnixTime } from 'date-fns';
import { Loader2, ServerCrash } from 'lucide-react';

import { useChatQuery } from '@/hooks/use-chat-query';
import { useChatScroll } from '@/hooks/use-chat-scroll';

import { ChatWelcome } from './chat-welcome';
import { ChatItem } from './chat-item';
import { Member, Profile } from '@/db/schema';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { useSocket } from '../providers/socket-provider';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

interface ChatMessagesProps {
  name: string;
  chatId: string;
  apiUrl: string;
  type: 'channel' | 'conversation';
  member: Member;
  profile: Profile;
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  profile,
  apiUrl,
  type,
}: ChatMessagesProps) => {
  const { socket, isConnected } = useSocket();

  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);
  //인피니트 로딩을 위한 준비
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      chatId,
    });

  //메세지 구독중
  useChatSocket({ queryKey, addKey, updateKey, bottomRef });
  useEffect(() => {
    if (!isConnected) return;
    socket!.send(
      JSON.stringify({
        action: 'enterroom',
        data: {
          roomId: chatId,
          userId: profile.name,
        },
      })
    );
  }, [isConnected]);
  //스크롤 감지
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });
  if (status === 'pending') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col overflow-y-auto ">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data &&
          data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.Items.map((message: any, j: any) => (
                <ChatItem
                  key={j}
                  // id={message.id}
                  currentMember={member}
                  member={message.member}
                  content={message.msg}
                  fileUrl={message.fileUrl}
                  deleted={message.deleted as boolean}
                  timestamp={message.createdAt}
                  isUpdated={message.updatedAt !== message.createdAt}
                />
              ))}
            </Fragment>
          ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
