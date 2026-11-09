'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  fill?: boolean;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'async' | 'sync' | 'auto';
  quality?: number;
  style?: CSSProperties;
};

const optimizedRemoteHosts = new Set(['ik.imagekit.io', 'files.manuscdn.com', 'speero.net']);

function canOptimizeSource(src: string) {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && optimizedRemoteHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  loading,
  decoding = 'async',
  style,
  ...props
}: OptimizedImageProps) {
  if (canOptimizeSource(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        loading={loading}
        decoding={decoding}
        style={style}
        {...props}
      />
    );
  }

  const {
    width,
    height,
    sizes,
    className,
    fetchPriority,
    priority: _priority,
    quality: _quality,
    ...rest
  } = props;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={loading ?? 'lazy'}
      decoding={decoding}
      fetchPriority={fetchPriority}
      style={
        fill
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...style,
            }
          : style
      }
      {...rest}
    />
  );
}
