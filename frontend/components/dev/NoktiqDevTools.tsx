'use client';

import { Noktiq } from 'noktiq/react';

export default function NoktiqDevTools() {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return <Noktiq enabled />;
}
