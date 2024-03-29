'use client';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { FileUpload } from '../file-upload';
import { cn } from '@/lib/utils';
import { upload } from '@vercel/blob/client';
import { createServer } from '@/db/queries';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Server name is required' }),
  file: typeof window === 'undefined' ? z.any() : z.instanceof(File),
});
const InitialModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: undefined,
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.name && values.file) {
      //blob 서버에 서버 이미지 올리기
      const newBlob = await upload(values.file.name, values.file, {
        access: 'public',
        handleUploadUrl: '/api/avatar/upload',
      });
      console.log(newBlob);
      //전달 받은 서버 이미지 url 과 이름으로 서버 생성
      const server = await createServer(newBlob.url, values.name);
    }
    //채널도 같이 생성

    try {
      // await axios.post('/api/servers', values);
      // if (values.name && values.file) {
      //   const newBlob = await upload(values.file.name, values.file, {
      //     access: 'public',
      //     handleUploadUrl: '/api/avatar/upload',
      //   });
      // }
      // toast({
      //   description: 'Your message has been sent.',
      // });
    } catch (error) {
      console.log(error);
    }
  };
  if (!isMounted) {
    return null;
  }
  return (
    <Dialog open>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold ">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an image.
            <br /> You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="px-6 space-y-8">
              <div className="flex items-center justify-center text-center ">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70 ">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              {isLoading ? (
                <Button variant="primary" disabled={isLoading}>
                  <div className={cn('animate-spin text-2xl')}>😆</div>
                </Button>
              ) : (
                <Button variant="primary" disabled={isLoading}>
                  Create
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InitialModal;
