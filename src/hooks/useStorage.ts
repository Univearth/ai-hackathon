import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Define the FoodItem type for use in the expiration page
export type FoodItem = {
  id?: string;
  name: string;
  expiration_date: string;
  image_url: string;
};

// Define the response type for storage
export type ResponseType = {
  id: string;
  content: string;
  createdAt: string;
  // Add any other properties needed for responses
};

// Create an atom with localStorage persistence
const responsesAtom = atomWithStorage<ResponseType[]>('responses', []);

export const useStorage = () => {
  const [responses, setResponses] = useAtom(responsesAtom);

  /**
   * Add a new item to storage
   */
  const setItem = (response: ResponseType) => {
    setResponses((prev) => [...prev, response]);
  };

  /**
   * Add a new food item to storage
   */
  const addFoodItem = (foodItem: FoodItem) => {
    const newResponse: ResponseType = {
      id: crypto.randomUUID(),
      content: JSON.stringify(foodItem),
      createdAt: new Date().toISOString(),
    };
    setItem(newResponse);
  };

  /**
   * Edit an item at the specified index
   */
  const editItem = (index: number, updatedResponse: ResponseType) => {
    setResponses((prev) => {
      const newResponses = [...prev];
      newResponses[index] = updatedResponse;
      return newResponses;
    });
  };

  /**
   * Edit a food item by id
   */
  const editFoodItemById = (id: string, foodItem: FoodItem) => {
    setResponses((prev) => {
      return prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            content: JSON.stringify(foodItem),
          };
        }
        return item;
      });
    });
  };

  /**
   * Get all items from storage
   */
  const getItems = (): ResponseType[] => {
    return responses;
  };

  /**
   * Get a specific item by id
   */
  const getItemById = (id: string): ResponseType | undefined => {
    return responses.find(item => item.id === id);
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
  const deleteItemById = (id: string) => {
    setResponses((prev) => prev.filter(item => item.id !== id));
  };

  /**
   * Delete all items from storage
   */
  const deleteAllItems = () => {
    setResponses([]);
  };

  return {
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
