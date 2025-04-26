'use client';
import ExpirationGraph from "@/components/ui/graph";
import { useStorage } from "@/hooks/useStorage";

const Graph = () => {
  const { getItems } = useStorage();
  const items = getItems();
  return (
    <div className="h-screen">
      <div className="h-full">
        <ExpirationGraph items={items} />
      </div>
    </div>
  );
};

export default Graph;
