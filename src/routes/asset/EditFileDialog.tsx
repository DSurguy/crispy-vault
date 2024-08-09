import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { AssetFile } from '../../types';

type EditFileDialogProps = {
  children: React.ReactNode | React.ReactNode[];
  file?: AssetFile | null;
  isOpen: boolean;
  onClose: (didCreate: boolean) => void;
}

export default function EditFileDialog({ children, file, isOpen, onClose }: EditFileDialogProps) {
  const title = file ? "Add New File to Asset" : "Edit Asset File";
  return (
    <>
      <Dialog open={isOpen} onClose={() => onClose(false)} className="relative z-50">
        {isOpen && <>
          <DialogBackdrop className="fixed inset-0 bg-black/30" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="w-10/12 bg-white p-4 rounded-md">
              <DialogTitle className="font-bold mb-4">{title}</DialogTitle>
              <div>{children}</div>
            </DialogPanel>
          </div>
        </>}
      </Dialog>
    </>
  )
}