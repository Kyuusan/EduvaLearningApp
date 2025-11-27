'use client';
import { motion } from 'motion/react';
import { useState, useRef, DragEvent } from 'react';
import { Upload, X } from 'lucide-react';

// Copy komponen ResponsiveModal dari SwapyUI
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import { Drawer as VaulDrawer } from 'vaul';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface DrawerContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

export const useResponsiveModal = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useResponsiveModal must be used within a ResponsiveModalProvider');
  }
  return context;
};

interface ResponsiveModalProps {
  children: ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  classname?: string;
  clsBtnClassname?: string;
}

export function ResponsiveModal({
  children,
  open: controlledOpen,
  setOpen: controlledSetOpen,
  classname,
  clsBtnClassname,
}: ResponsiveModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledSetOpen || setInternalOpen;

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const trigger = React.Children.toArray(children).find(
    (child: any) => child.type === ResponsiveModalTrigger
  );
  const content = React.Children.toArray(children).filter(
    (child: any) => child.type !== ResponsiveModalTrigger
  );

  const desktopModal =
    isDesktop && mounted
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-zoom-out p-4'
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'relative w-full max-w-md max-h-[90vh] overflow-y-auto border bg-white dark:bg-neutral-900 rounded-lg cursor-default',
                    classname
                  )}
                >
                  <div className='sticky top-0 right-0 z-10 flex justify-end p-2 bg-white dark:bg-neutral-900'>
                    <button
                      className={cn(
                        'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 p-2 rounded-md transition-opacity',
                        clsBtnClassname
                      )}
                      onClick={() => setOpen(false)}
                      aria-label='Close'
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {content}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {trigger}
      {desktopModal}
      {!isDesktop && (
        <VaulDrawer.Root shouldScaleBackground open={open} onOpenChange={setOpen}>
          <VaulDrawer.Portal>
            <VaulDrawer.Overlay className='fixed inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-sm' />
            <VaulDrawer.Content className='fixed bottom-0 left-0 z-50 w-full max-h-[96%] bg-white dark:bg-neutral-900 rounded-t-2xl'>
              <div className='mx-auto w-16 h-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600 my-4' />
              <div className='w-full mx-auto max-h-[85vh] overflow-y-auto px-4 pb-6'>
                {content}
              </div>
            </VaulDrawer.Content>
          </VaulDrawer.Portal>
        </VaulDrawer.Root>
      )}
    </DrawerContext.Provider>
  );
}

export function ResponsiveModalContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function ResponsiveModalTrigger({ children }: { children: ReactNode }) {
  const { setOpen } = useResponsiveModal();
  return <div onClick={() => setOpen(true)}>{children}</div>;
}



export default function MyPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }
    
    console.log('Uploading file:', selectedFile);
    
    handleRemoveImage();
    setDrawerOpen(false);
  };

  return (
    <>
      <div className='flex justify-center min-h-screen items-center bg-neutral-50 dark:bg-neutral-950'>
        <motion.button
          onClick={() => setDrawerOpen(true)}
          whileTap={{ scale: 0.95 }}
          className='inline-flex h-12 w-fit px-8 items-center justify-center rounded-lg border-2 dark:border-[#656fe2] border-[#c0c6fc] dark:bg-[linear-gradient(110deg,#1e2a78,45%,#3749be,55%,#1e2a78)] bg-[linear-gradient(110deg,#3d5af1,45%,#5471ff,55%,#3d5af1)] font-medium text-white transition-all hover:shadow-lg'
        >
          Open Upload Dialog
        </motion.button>
      </div>

      {/* Cara Penggunaan: Sama seperti sebelumnya! */}
      <ResponsiveModal open={drawerOpen} setOpen={setDrawerOpen}>
        <ResponsiveModalContent>
          <figure className='flex flex-col space-y-1.5 text-center h-fit dark:bg-neutral-800 md:p-4 p-6 md:pt-0'>
            <h1 className='font-medium text-2xl'>Update Profile Image</h1>
            <p className='text-sm text-neutral-600 dark:text-neutral-400'>
              Drag and drop your image here, or click to browse
            </p>
            
            <div data-vaul-no-drag className='py-4 space-y-4'>
              {/* Preview Avatar */}
              <div className='relative flex justify-center'>
                <div className='relative'>
                  <span className='flex justify-center overflow-hidden rounded-full w-40 h-40 border-4 border-neutral-200 dark:border-neutral-700'>
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span className='grid place-content-center h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold'>
                        JP
                      </span>
                    )}
                  </span>
                  
                  {previewUrl && (
                    <button
                      onClick={handleRemoveImage}
                      className='absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-full border-2 border-dashed rounded-lg p-6 cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]' 
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }
                `}
              >
                <div className='flex flex-col items-center gap-2'>
                  <div className={`
                    p-3 rounded-full transition-colors
                    ${isDragging 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-neutral-100 dark:bg-neutral-800'
                    }
                  `}>
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-neutral-600 dark:text-neutral-400'}`} />
                  </div>
                  
                  <div className='text-center'>
                    <p className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                      {isDragging ? 'Drop your image here' : 'Drag & drop or click to browse'}
                    </p>
                    <p className='text-xs text-neutral-400 dark:text-neutral-600 mt-1'>
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='hidden'
                />
              </div>

              {/* File Info */}
              {selectedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='w-full p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left'
                >
                  <p className='text-sm text-neutral-700 dark:text-neutral-300 truncate'>
                    <span className='font-medium'>Selected:</span> {selectedFile.name}
                  </p>
                  <p className='text-xs text-neutral-500 dark:text-neutral-500 mt-1'>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type='button'
                onClick={handleSubmit}
                disabled={!selectedFile}
                className={`
                  w-full rounded-lg p-3 font-medium transition-all
                  ${selectedFile
                    ? 'dark:bg-white bg-black dark:text-black text-white hover:opacity-90 cursor-pointer'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  }
                `}
              >
                Submit
              </button>
            </div>
          </figure>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}