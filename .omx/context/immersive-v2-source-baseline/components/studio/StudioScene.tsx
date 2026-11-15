'use client';

import { useEffect, useRef } from 'react';
import type { StudioSceneProps } from '@/lib/studio-contract';
import { createStudioController, type StudioController } from './scene/controller';

export default function StudioScene(props: StudioSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<StudioController | null>(null);
  const current = useRef(props);

  useEffect(() => {
    current.current = props;
    controller.current?.update(props);
  }, [props]);

  useEffect(() => {
    if (!host.current) return;
    const mounted = createStudioController(host.current, {
      ...current.current,
      onSelectProject: (id) => current.current.onSelectProject(id),
      onStatusChange: (status) => current.current.onStatusChange(status),
    });
    controller.current = mounted;
    return () => {
      controller.current = null;
      mounted.dispose();
    };
  }, []);

  return <div ref={host} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
