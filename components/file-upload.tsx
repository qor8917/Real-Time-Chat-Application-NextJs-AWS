'use client';

import { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react';
import { X } from 'lucide-react';

import { useToast } from './ui/use-toast';
import Image from 'next/image';

interface FileUploadProps {
  onChange: (file: File | null) => void;
  value: string;
}
export function FileUpload({ onChange, value }: FileUploadProps) {
  useEffect(() => {
    if (value) setData((prev) => ({ ...prev, image: value }));
  }, [value]);
  const { toast } = useToast();
  const [data, setData] = useState<{
    image: string | null;
  }>({
    image: null,
  });
  const [file, setFile] = useState<File | null>(null);

  const [dragActive, setDragActive] = useState(false);

  const onChangePicture = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (file) {
        if (file.size / 1024 / 1024 > 4) {
          //4MB 이상이면 에러 토스트 디스플레이
          toast({
            variant: 'destructive',
            description: 'File size too big (max 4MB)',
          });
        } else {
          //미리보기 이미지 생성
          setFile(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            setData((prev) => ({ ...prev, image: e.target?.result as string }));
          };
          reader.readAsDataURL(file);
          try {
            onChange(file);
          } catch (error) {
            toast({
              variant: 'destructive',
              description: 'Uh oh! Something went wrong',
            });
          }
        }
      }
    },
    [setData]
  );

  return (
    <div>
      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-500">
          Accepted formats: .png, .jpg, .gif
        </p>
      </div>
      <label
        htmlFor="image-upload"
        className="group relative mt-2 flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
      >
        <div
          className="absolute z-[5] h-full w-full rounded-md"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) {
              if (file.size / 1024 / 1024 > 4) {
                toast({
                  variant: 'destructive',
                  description: 'File size too big (max 4MB)',
                });
              } else {
                setFile(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                  setData((prev) => ({
                    ...prev,
                    image: e.target?.result as string,
                  }));
                };
                reader.readAsDataURL(file);
                try {
                  onChange(file);
                } catch (error) {
                  toast({
                    variant: 'destructive',
                    description: 'Uh oh! Something went wrong',
                  });
                }
              }
            }
          }}
        />
        <div
          className={`${
            dragActive ? 'border-2 border-black' : ''
          } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all ${
            data.image
              ? 'bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md'
              : 'bg-white opacity-100 hover:bg-gray-50'
          }`}
        >
          <svg
            className={`${
              dragActive ? 'scale-110' : 'scale-100'
            } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M12 12v9"></path>
            <path d="m16 16-4-4-4 4"></path>
          </svg>
          <p className="mt-2 text-center text-sm text-gray-500">
            Drag and drop or click to upload.
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Max file size: 4MB
          </p>
          <span className="sr-only">Photo upload</span>
        </div>
        {data.image && (
          <>
            <Image
              src={data.image}
              alt="Preview"
              fill
              className="h-full w-full rounded-md object-cover"
            />
            <button
              className="z-10 bg-rose-500 text-white rounded-full absolute -top-2 -right-2 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
                setData((prev) => ({ ...prev, image: null }));
                onChange(null);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm relative">
        <input
          id="image-upload"
          name="image"
          type="file"
          accept="image/*"
          className="sr-only"
          onInput={onChangePicture}
        />
      </div>
    </div>
  );
}
