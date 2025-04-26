'use client';

import { ResponseTypes } from '@/types/response';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Create an atom with localStorage persistence
const responsesAtom = atomWithStorage<ResponseTypes[]>('responses', []);

export const useStorage = () => {
  const [responses, setResponses] = useAtom(responsesAtom);

  /**
   * Add a new item to storage
   */
  const setItem = (response: ResponseTypes) => {
    setResponses((prev) => [...prev, response]);
  };

  /**
   * Add a new food item to storage
   */
  const addFoodItem = (foodItem: ResponseTypes) => {
    setItem(foodItem);
  };

  /**
   * Edit an item at the specified index
   */
  const editItem = (index: number, updatedResponse: ResponseTypes) => {
    setResponses((prev) => {
      const newResponses = [...prev];
      newResponses[index] = updatedResponse;
      return newResponses;
    });
  };

  /**
   * Edit a food item by id
   */
  const editFoodItemById = (image_url: string, foodItem: ResponseTypes) => {
    setResponses((prev) => {
      return prev.map(item => {
        if (item.image_url === image_url) {
          return {
            ...item,
            ...foodItem,
          };
        }
        return item;
      });
    });
  };

  /**
   * Get all items from storage
   */
  const getItems = (): ResponseTypes[] => {
    return responses;
  };

  /**
   * Get a specific item by id
   */
  const getItemById = (image_url: string): ResponseTypes | undefined => {
    return responses.find(item => item.image_url === image_url);
  };

  /**
   * Delete an item at the specified index
   */
  const deleteItem = (index: number) => {
    setResponses((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Delete an item by id
   */
  const deleteItemById = (image_url: string) => {
    setResponses((prev) => prev.filter(item => item.image_url !== image_url));
  };

  /**
   * Delete all items from storage
   */
  const deleteAllItems = () => {
    setResponses([]);
  };

  return {
    responses,
    setItem,
    addFoodItem,
    editItem,
    editFoodItemById,
    getItems,
    getItemById,
    deleteItem,
    deleteItemById,
    deleteAllItems,
  };
};

export default useStorage;
