'use client';

import { ResponseTypes } from '@/types/response';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const selectedItemsAtom = atomWithStorage<ResponseTypes[]>('selectedItems', []);

export const useSelectedItems = () => {
  const [selectedItems, setSelectedItems] = useAtom(selectedItemsAtom);

  /**
   * アイテムが選択されているかチェック
   */
  const isSelected = (item: ResponseTypes): boolean => {
    return selectedItems.some((selectedItem) => selectedItem.image_url === item.image_url);
  };

  /**
   * アイテムの選択/選択解除を切り替える
   */
  const toggleItemSelection = (item: ResponseTypes) => {
    if (isSelected(item)) {
      setSelectedItems(selectedItems.filter(
        (selectedItem) => selectedItem.image_url !== item.image_url
      ));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  /**
   * 全ての選択をクリア
   */
  const clearSelectedItems = () => {
    setSelectedItems([]);
  };

  return {
    selectedItems,
    isSelected,
    toggleItemSelection,
    clearSelectedItems,
  };
};

export default useSelectedItems;
