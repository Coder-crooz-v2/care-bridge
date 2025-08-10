"use client";
import { Suspense } from "react";
import MainComponent from "./components/MainComponent";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <MainComponent />
    </Suspense>
  );
};

export default Page;
