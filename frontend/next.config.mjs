import createNextIntlPlugin from 'next-intl/plugin';
import { withNoktiq } from 'noktiq/next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(withNoktiq(nextConfig));
