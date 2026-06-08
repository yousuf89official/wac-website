declare module 'react-simple-maps' {
  import { ComponentType, ReactNode } from 'react';

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, any>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | Record<string, any>;
    children: (data: { geographies: any[] }) => ReactNode;
  }

  interface GeographyProps {
    geography: any;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: { default?: React.CSSProperties; hover?: React.CSSProperties; pressed?: React.CSSProperties };
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseMove?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    children?: ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}
