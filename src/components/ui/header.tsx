import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Sistema MDE</span>
        </div>
        
        <Button variant="default" className="shadow-elegant" onClick={() => window.location.href = '/auth'}>
          Login
        </Button>
      </div>
    </header>
  );
};