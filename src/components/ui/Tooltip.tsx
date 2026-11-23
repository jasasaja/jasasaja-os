import React, { useId, useState } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'start' | 'end';
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
}

function getPositionClasses(
  side: 'top' | 'bottom' | 'left' | 'right',
  align: 'center' | 'start' | 'end',
): string {
  if (side === 'left') {
    return 'right-full top-1/2 -translate-y-1/2 mr-2';
  }
  if (side === 'right') {
    return 'left-full top-1/2 -translate-y-1/2 ml-2';
  }
  const vertical = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const horizontal =
    align === 'start'
      ? 'left-0'
      : align === 'end'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';
  return `${vertical} ${horizontal}`;
}

export function Tooltip({ content, side = 'top', align = 'center', children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  const clonedChild = React.cloneElement(children, {
    'aria-describedby': visible ? tooltipId : children.props['aria-describedby'],
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      setVisible(true);
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      setVisible(false);
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      setVisible(true);
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      setVisible(false);
      children.props.onBlur?.(e);
    },
  });

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      {clonedChild}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 px-2.5 py-1.5 text-[13px] leading-normal font-medium rounded-md whitespace-nowrap',
            'bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 shadow-overlay',
            getPositionClasses(side, align),
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
