'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useStorage, { ResponseType } from '@/hooks/useStorage';
import { useState } from 'react';

const StorageTest = () => {
  const { setItem, editItem, getItems, deleteItem, deleteAllItems } = useStorage();
  const [content, setContent] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const responses = getItems();

  const handleAdd = () => {
    if (!content.trim()) return;

    const newResponse: ResponseType = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
    };

    setItem(newResponse);
    setContent('');
  };

  const handleEdit = () => {
    if (editIndex === null || !editContent.trim()) return;

    const updatedResponse: ResponseType = {
      ...responses[editIndex],
      content: editContent,
    };

    editItem(editIndex, updatedResponse);
    setEditIndex(null);
    setEditContent('');
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditContent(responses[index].content);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={content}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
              placeholder="Enter content to store"
              className="flex-1"
            />
            <Button onClick={handleAdd}>Add Item</Button>
          </div>

          {editIndex !== null && (
            <div className="flex gap-2 mb-4">
              <Input
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditContent(e.target.value)}
                placeholder="Edit content"
                className="flex-1"
              />
              <Button onClick={handleEdit}>Save Edit</Button>
              <Button variant="outline" onClick={() => setEditIndex(null)}>Cancel</Button>
            </div>
          )}

          {responses.length > 0 && (
            <Button
              variant="destructive"
              onClick={deleteAllItems}
              className="mt-2"
            >
              Clear All
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {responses.map((response, index) => (
          <Card key={response.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="mb-1">{response.content}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(response.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(index)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StorageTest;