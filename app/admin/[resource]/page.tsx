'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { RESOURCES, isResourceName } from '@/lib/resources';
import ResourceManager from '@/components/admin/ResourceManager';

export default function Page({ params }: PageProps<'/admin/[resource]'>) {
  const { resource } = use(params);
  if (!isResourceName(resource)) notFound();
  return <ResourceManager key={resource} name={resource} config={RESOURCES[resource]} />;
}
