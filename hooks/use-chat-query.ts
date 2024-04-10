import qs from 'query-string';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSocket } from '@/components/providers/socket-provider';
import { NextResponse } from 'next/server';
// import { useSocket } from '@/components/providers/socket-provider';

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  chatId: string;
}

export const useChatQuery = ({ queryKey, apiUrl, chatId }: ChatQueryProps) => {
  //한번마다 가져올 메세지 API
  const fetchMessages = async (pageParam: any) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          roomId: chatId,
          createdAt: pageParam ?? null,
        },
      },
      { skipNull: true }
    );
    const res = await fetch(url);
    const data = await res.json();

    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: ({ pageParam }) => fetchMessages(pageParam),
      initialPageParam: null,
      getNextPageParam: (lastPage: any) => {
        return lastPage?.LastEvaluatedKey?.createdAt ?? null;
      },
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
