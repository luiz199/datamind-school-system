"use client";

export function CardSkeleton() {
  return (
    <div className="paper-card p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-[#e0d8cc] dark:bg-[#2a2a3e] rounded" />
          <div className="h-6 w-12 bg-[#e0d8cc] dark:bg-[#2a2a3e] rounded" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#e0d8cc] dark:bg-[#2a2a3e]" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="h-4 w-24 bg-[#e0d8cc] dark:bg-[#2a2a3e] rounded" />
          <div className="h-4 w-32 bg-[#e0d8cc] dark:bg-[#2a2a3e] rounded" />
          <div className="h-4 w-16 bg-[#e0d8cc] dark:bg-[#2a2a3e] rounded" />
          <div className="h-4 w-20 bg-[#e0d8cc] dark:bg-[#2a2a3e] rounded" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse h-64 sm:h-72 bg-[#f0ece6] dark:bg-[#1e1e2e] rounded-xl flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#0d7377] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
