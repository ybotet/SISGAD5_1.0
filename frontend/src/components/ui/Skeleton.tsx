import React from 'react';

function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Bar key={i} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Bar key={c} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <Bar className="h-5 w-1/3" />
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-5/6" />
      <Bar className="h-4 w-2/3" />
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Bar className="h-4 w-24" />
          <Bar className="h-9 w-full" />
        </div>
      ))}
      <Bar className="h-9 w-32" />
    </div>
  );
}

export default function Skeleton() {
  return <Bar className="h-4 w-full" />;
}