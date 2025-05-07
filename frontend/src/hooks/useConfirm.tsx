import { useModal } from '@contexts';

export const useConfirm = () => {
  const { openModal } = useModal();

  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal('confirmModal', {
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  return { confirm };
};
