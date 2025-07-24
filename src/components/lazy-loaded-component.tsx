"use client";

import React from 'react';

export default function LazyLoadedComponent() {
  return (
    <div className="p-8 bg-blue-100 rounded-lg text-blue-800">
      This component was loaded lazily!
    </div>
  );
}