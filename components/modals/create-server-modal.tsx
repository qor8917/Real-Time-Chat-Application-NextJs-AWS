'use client';

import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useModal } from '@/hooks/use-modal-store';
import { FileUpload } from '../file-upload';
import { createServer } from '@/db/queries';
import { upload } from '@vercel/blob/client';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Server name is required' }) || z.null(),
  file: z.any(),
});

export const CreateServerModal = () => {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === 'createServer';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      file: '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.name) {
      //blob 서버에 서버 이미지 올리기
      let newBlob;
      if (values.file) {
        newBlob = await upload(values.file.name, values.file, {
          access: 'public',
          handleUploadUrl: '/api/avatar/upload',
        });
      }
      const server = await createServer(
        values.name ? values.name : null,
        newBlob ? newBlob.url : null
      );
      router.refresh();
      handleClose();
    }
  };
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
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
                        <FileUpload
                          onChange={field.onChange}
                          value={field.value}
                        />
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
