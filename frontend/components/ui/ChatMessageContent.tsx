"use client";

import React, { useMemo } from 'react';

interface ChatMessageContentProps {
  content: string;
  isStreaming?: boolean;
  isUser?: boolean;
  className?: string;
}

/**
 * Parses inline markdown:
 * - **bold** (and handles unclosed bold during streaming)
 * - *italic*
 * - `code`
 * - [label](url)
 */
function parseInline(
  text: string,
  isUser: boolean,
  keyPrefix: string
): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. Markdown link: [label](url)
  // 2. Inline code: `code`
  // 3. Bold: **text**
  // 4. Italic: *text* (excluding **)
  const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|`[^`]+`|\*\*[^*]+\*\*|(?<!\*)\*[^*\n]+?\*(?!\*))/g;

  const parts = text.split(tokenRegex);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const key = `${keyPrefix}-part-${i}`;

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      elements.push(
        <strong
          key={key}
          className={
            isUser
              ? 'font-bold text-[#040608]'
              : 'font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
          }
        >
          {boldText}
        </strong>
      );
    }
    // Italic *text*
    else if (
      part.startsWith('*') &&
      part.endsWith('*') &&
      part.length >= 2 &&
      !part.startsWith('**')
    ) {
      const italicText = part.slice(1, -1);
      elements.push(
        <em key={key} className="italic">
          {italicText}
        </em>
      );
    }
    // Inline code `code`
    else if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeText = part.slice(1, -1);
      elements.push(
        <code
          key={key}
          className={
            isUser
              ? 'px-1.5 py-0.5 rounded bg-black/10 font-mono text-[11px] sm:text-[12px] text-[#090c10]'
              : 'px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] sm:text-[12px] text-[#bce7f7]'
          }
        >
          {codeText}
        </code>
      );
    }
    // Markdown link [label](url)
    else if (part.startsWith('[') && part.includes('](')) {
      const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        elements.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isUser
                ? 'underline font-semibold text-[#090c10] hover:opacity-80 transition-opacity'
                : 'underline underline-offset-2 text-[#7ed8f8] hover:text-[#bae2f0] transition-colors'
            }
          >
            {label}
          </a>
        );
      } else {
        elements.push(part);
      }
    } else {
      elements.push(part);
    }
  }

  return elements;
}

export default function ChatMessageContent({
  content,
  isStreaming = false,
  isUser = false,
  className = '',
}: ChatMessageContentProps) {
  const renderedElements = useMemo(() => {
    if (!content && !isStreaming) return null;

    let normalizedText = content || '';

    // If streaming, ensure an unclosed ** does not show as raw asterisks
    if (isStreaming) {
      const asterisksMatches = normalizedText.match(/\*\*/g);
      const boldTokenCount = asterisksMatches ? asterisksMatches.length : 0;
      if (boldTokenCount % 2 === 1) {
        normalizedText += '**';
      }
    }

    const lines = normalizedText.split('\n');
    const totalLines = lines.length;

    const cursor = isStreaming ? (
      <span
        aria-hidden="true"
        className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-[#d6f3fc] animate-pulse rounded-xs"
      />
    ) : null;

    return lines.map((line, lineIdx) => {
      const isLastLine = lineIdx === totalLines - 1;
      const trimmed = line.trim();

      // Empty line / paragraph break
      if (!trimmed) {
        return (
          <div key={`line-${lineIdx}`} className="h-2">
            {isLastLine && cursor}
          </div>
        );
      }

      // Horizontal separator line (e.g. "---" or "***")
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        return (
          <div key={`line-${lineIdx}`} className="my-2.5">
            <div
              className={`border-t ${
                isUser ? 'border-black/15' : 'border-white/15'
              }`}
            />
            {isLastLine && cursor}
          </div>
        );
      }

      // Header (e.g. "### Header" or "## Header")
      const headerMatch = line.match(/^#{1,3}\s+(.*)$/);
      if (headerMatch) {
        return (
          <div
            key={`line-${lineIdx}`}
            className={`font-semibold mt-2 mb-1 ${
              isUser
                ? 'text-[#040608] text-[13px] sm:text-[13.5px]'
                : 'text-white text-[13px] sm:text-[13.5px]'
            }`}
          >
            {parseInline(headerMatch[1], isUser, `line-${lineIdx}`)}
            {isLastLine && cursor}
          </div>
        );
      }

      // Bullet list item: starts with "- ", "* ", or "• "
      const bulletMatch = line.match(/^(\s*[-*•]\s+)(.*)$/);
      if (bulletMatch) {
        const bulletBody = bulletMatch[2];
        return (
          <div
            key={`line-${lineIdx}`}
            className="flex items-start gap-2 my-0.5 pl-0.5 leading-[1.48]"
          >
            <span
              className={`select-none text-[12px] leading-[1.48] mt-px shrink-0 ${
                isUser ? 'text-[#1e2d33]' : 'text-[#819fa7]'
              }`}
            >
              •
            </span>
            <div className="flex-1 min-w-0">
              {parseInline(bulletBody, isUser, `line-${lineIdx}`)}
              {isLastLine && cursor}
            </div>
          </div>
        );
      }

      // Numbered list item: starts with "1. ", "2. ", etc.
      const numMatch = line.match(/^(\s*(\d+)\.\s+)(.*)$/);
      if (numMatch) {
        const num = numMatch[2];
        const numBody = numMatch[3];
        return (
          <div
            key={`line-${lineIdx}`}
            className="flex items-start gap-2 my-0.5 pl-0.5 leading-[1.48]"
          >
            <span
              className={`select-none font-mono text-[11px] leading-[1.48] mt-px shrink-0 ${
                isUser ? 'text-[#1e2d33]' : 'text-[#819fa7]'
              }`}
            >
              {num}.
            </span>
            <div className="flex-1 min-w-0">
              {parseInline(numBody, isUser, `line-${lineIdx}`)}
              {isLastLine && cursor}
            </div>
          </div>
        );
      }

      // Standard text line
      return (
        <div
          key={`line-${lineIdx}`}
          className="my-0.5 min-w-0 leading-[1.48]"
        >
          {parseInline(line, isUser, `line-${lineIdx}`)}
          {isLastLine && cursor}
        </div>
      );
    });
  }, [content, isStreaming, isUser]);

  return (
    <div className={`break-words text-[12.5px] sm:text-[13px] ${className}`}>
      {renderedElements}
    </div>
  );
}
