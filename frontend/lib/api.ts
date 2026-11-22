/**
 * API Client for Portfolio Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Types
export interface ChatRequest {
    message: string;
    session_id?: string;
    locale: 'tr' | 'en';
}

export interface ChatResponse {
    response: string;
    session_id: string;
}

export interface ChatSuggestion {
    question: string;
    category: string;
}

export interface ChatSuggestionsResponse {
    suggestions: ChatSuggestion[];
}

export interface ContactRequest {
    name: string;
    email: string;
    subject?: string;
    message: string;
}

export interface ContactResponse {
    success: boolean;
    message: string;
}

export interface AnalyticsEvent {
    event_type: string;
    page?: string;
    metadata?: Record<string, unknown>;
}

// API Functions
export class ChatApiError extends Error {
    constructor(public code: string, public retryAfter = 0) { super(code); }
}

export async function sendChatMessage(data: ChatRequest, clientKey: string, signal: AbortSignal): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Chat-Client': clientKey,
        },
        body: JSON.stringify(data),
        signal,
        cache: 'no-store',
    });

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        const code = body?.detail?.code || (response.status === 429 ? 'usage_limit' : response.status === 422 ? 'invalid_message' : 'service_unavailable');
        throw new ChatApiError(code, Math.min(86400, Math.max(0, Number(response.headers.get('Retry-After')) || 0)));
    }

    const result = await response.json();
    if (typeof result?.response !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(result?.session_id)) throw new ChatApiError('service_unavailable');
    return result;
}

export async function resetChatSession(sessionId: string | null, clientKey: string): Promise<void> {
    const response = await fetch(`${API_URL}/chat/reset`, {
        method: 'POST', headers: {'Content-Type': 'application/json', 'X-Chat-Client': clientKey},
        body: JSON.stringify({session_id: sessionId}), signal: AbortSignal.timeout(5000), cache: 'no-store',
    });
    if (!response.ok) throw new ChatApiError('reset_failed');
}

export async function getChatSuggestions(): Promise<ChatSuggestionsResponse> {
    const response = await fetch(`${API_URL}/chat/suggestions`);

    if (!response.ok) {
        throw new Error(`Suggestions API error: ${response.status}`);
    }

    return response.json();
}

export async function submitContactForm(data: ContactRequest): Promise<ContactResponse> {
    const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Contact API error: ${response.status}`);
    }

    return response.json();
}

export async function trackAnalytics(data: AnalyticsEvent): Promise<void> {
    try {
        await fetch(`${API_URL}/analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        // Silently fail for analytics - don't block user experience
        console.warn('Analytics tracking failed:', error);
    }
}
