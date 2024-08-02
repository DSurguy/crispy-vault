import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import AddFileForm from './AddFileForm';

type AddFileDialogProps = {
  isOpen: boolean;
  onClose: (didCreate: boolean) => void;
}

export default function AddFileDialog({ isOpen, onClose }: AddFileDialogProps) {
  return (
    <>
      <Dialog open={isOpen} onClose={() => onClose(false)} className="relative z-50">
        {isOpen && <>
          <DialogBackdrop className="fixed inset-0 bg-black/30" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="w-10/12 bg-white p-4 rounded-md">
              <DialogTitle className="font-bold mb-4">Add File to Asset</DialogTitle>
              <AddFileForm onComplete={onClose} />
            </DialogPanel>
          </div>
        </>}
      </Dialog>
    </>
  )
}