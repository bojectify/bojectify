import { ReactNode, JSX } from 'react';

export type BasicComponentProps<T extends Element = HTMLDivElement> = {
  testId?: string;
  classNames?: (string | undefined)[];
  nativeProps?: T extends SVGElement
    ? React.SVGAttributes<T>
    : React.HTMLAttributes<T>;
};

export type Children = { children: ReactNode | JSX.Element | JSX.Element[] };
