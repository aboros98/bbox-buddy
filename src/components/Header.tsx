
import React from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("px-6 py-4 backdrop-blur-sm bg-white/80 border-b", className)}>
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary grid place-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M3 15v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
              <path d="M15 8h2a2 2 0 0 1 2 2v1" />
              <path d="M7 8H5a2 2 0 0 0-2 2v1" />
              <path d="M10 2v6" />
              <path d="M14 2v6" />
              <path d="M2 12h20" />
              <path d="M5 19v2" />
              <path d="M19 19v2" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            BBox Buddy
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Documentation
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
