
import { NavBar } from "@/components/NavBar";
import Chat from "@/components/Chat";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="container flex flex-col flex-1 mx-auto py-4 max-w-4xl">
        <div className="flex-1 border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Index;
