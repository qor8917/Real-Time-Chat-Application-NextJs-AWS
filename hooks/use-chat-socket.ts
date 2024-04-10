import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/components/providers/socket-provider';

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  bottomRef: any;
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
  bottomRef,
}: ChatSocketProps) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isConnected) return;
    socket!.onmessage = (event: any) => {
      console.log(event);
      queryClient.setQueryData([queryKey], (oldData: any) => {
        console.log(event);
        const data = JSON.parse(event.data);
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                Items: [data],
              },
            ],
          };
        }
        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          Items: [data, ...newData[0].Items],
        };
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }, 100);
        return {
          ...oldData,
          pages: newData,
        };
      });
    };
    // socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
    //   queryClient.setQueryData([queryKey], (oldData: any) => {
    //     if (!oldData || !oldData.pages || oldData.pages.length === 0) {
    //       return oldData;
    //     }
    //     const newData = oldData.pages.map((page: any) => {
    //       return {
    //         ...page,
    //         items: page.items.map((item: MessageWithMemberWithProfile) => {
    //           if (item.id === message.id) {
    //             return message;
    //           }
    //           return item;
    //         }),
    //       };
    //     });
    //     return {
    //       ...oldData,
    //       pages: newData,
    //     };
    //   });
    // });

    // if (event.data.key !== addKey) return;
    // queryClient.setQueryData([queryKey], (oldData: any) => {
    //   console.log('event', event);
    //   console.log('oldData', oldData);
    //   // if (!oldData || !oldData.pages || oldData.pages.length === 0) {
    //   // return {
    //   //   pages: [
    //   //     {
    //   //       // Items : [event.]
    //   //     },
    //   //   ],
    //   // };
    //   // }
    // });
    // queryClient.setQueryData([queryKey], (oldData: any) => {
    //   if (!oldData || !oldData.pages || oldData.pages.length === 0) {
    //     return {
    //       pages: [
    //         {
    //           items: [event.data],
    //         },
    //       ],
    //     };
    //   }
    //   const newData = [...oldData.pages];
    //   newData[0] = {
    //     ...newData[0],
    //     Items: [event.Items, ...newData[0].Items],
    //   };
    //   return {
    //     ...oldData,
    //     pages: newData,
    //   };
    // });
  }, [isConnected, socket]);
};
