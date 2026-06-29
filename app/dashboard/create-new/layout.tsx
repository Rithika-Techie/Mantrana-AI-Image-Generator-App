import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MantranaAi',
  description: 'aPicture generation',
};

export default function DashboardCreateNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
