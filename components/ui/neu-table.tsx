"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NeuTableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const NeuTable = React.forwardRef<HTMLTableElement, NeuTableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-[var(--neu-radius)]">
        <table
          ref={ref}
          className={cn(
            "w-full border-collapse",
            "bg-[var(--neu-surface)]",
            "border border-[var(--neu-border)]",
            "shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

NeuTable.displayName = "NeuTable";

interface NeuTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const NeuTableHeader = React.forwardRef<HTMLTableSectionElement, NeuTableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          "bg-[var(--neu-surface-light)]",
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

NeuTableHeader.displayName = "NeuTableHeader";

interface NeuTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const NeuTableBody = React.forwardRef<HTMLTableSectionElement, NeuTableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn("divide-y divide-[var(--neu-border)]", className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

NeuTableBody.displayName = "NeuTableBody";

interface NeuTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

const NeuTableRow = React.forwardRef<HTMLTableRowElement, NeuTableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          "transition-colors duration-150",
          "hover:bg-[var(--neu-surface-light)]",
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

NeuTableRow.displayName = "NeuTableRow";

interface NeuTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const NeuTableHead = React.forwardRef<HTMLTableCellElement, NeuTableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          "px-4 py-3 text-left",
          "text-sm font-semibold text-[var(--neu-text)]",
          "border-b border-[var(--neu-border)]",
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);

NeuTableHead.displayName = "NeuTableHead";

interface NeuTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const NeuTableCell = React.forwardRef<HTMLTableCellElement, NeuTableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "px-4 py-3",
          "text-sm text-[var(--neu-text-secondary)]",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

NeuTableCell.displayName = "NeuTableCell";

export {
  NeuTable,
  NeuTableHeader,
  NeuTableBody,
  NeuTableRow,
  NeuTableHead,
  NeuTableCell,
  type NeuTableProps,
  type NeuTableHeaderProps,
  type NeuTableBodyProps,
  type NeuTableRowProps,
  type NeuTableHeadProps,
  type NeuTableCellProps,
};
