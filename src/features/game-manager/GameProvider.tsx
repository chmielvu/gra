import React from 'react';

// This provider is part of the planned architecture. For now, it simply renders children.
// It can be expanded later to provide specific contexts if needed.
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
};
