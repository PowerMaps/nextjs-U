import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../table';

describe('Table Component', () => {
  it('renders basic table structure correctly', () => {
    render(
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV002</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell>PayPal</TableCell>
            <TableCell className="text-right">$150.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$400.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    // Check that table elements are rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('A list of your recent invoices.')).toBeInTheDocument();
    
    // Check headers
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    
    // Check data rows
    expect(screen.getByText('INV001')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    
    expect(screen.getByText('INV002')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    
    // Check footer
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(
      <Table data-testid="table">
        <TableHeader data-testid="header">
          <TableRow data-testid="header-row">
            <TableHead data-testid="header-cell">Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="body">
          <TableRow data-testid="body-row">
            <TableCell data-testid="body-cell">John</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByTestId('table');
    const header = screen.getByTestId('header');
    const headerRow = screen.getByTestId('header-row');
    const headerCell = screen.getByTestId('header-cell');
    const body = screen.getByTestId('body');
    const bodyRow = screen.getByTestId('body-row');
    const bodyCell = screen.getByTestId('body-cell');

    // Check table wrapper has overflow-auto
    expect(table.parentElement).toHaveClass('relative', 'w-full', 'overflow-auto');
    
    // Check table has correct classes
    expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    
    // Check header styling
    expect(header).toHaveClass('[&_tr]:border-b');
    
    // Check row styling
    expect(headerRow).toHaveClass('border-b', 'transition-colors', 'hover:bg-muted/50');
    expect(bodyRow).toHaveClass('border-b', 'transition-colors', 'hover:bg-muted/50');
    
    // Check cell styling
    expect(headerCell).toHaveClass('h-12', 'px-4', 'text-left', 'align-middle', 'font-medium', 'text-muted-foreground');
    expect(bodyCell).toHaveClass('p-4', 'align-middle');
  });

  it('forwards refs correctly', () => {
    const tableRef = React.createRef<HTMLTableElement>();
    const headerRef = React.createRef<HTMLTableSectionElement>();
    const bodyRef = React.createRef<HTMLTableSectionElement>();
    const rowRef = React.createRef<HTMLTableRowElement>();
    const headRef = React.createRef<HTMLTableCellElement>();
    const cellRef = React.createRef<HTMLTableCellElement>();

    render(
      <Table ref={tableRef}>
        <TableHeader ref={headerRef}>
          <TableRow ref={rowRef}>
            <TableHead ref={headRef}>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={bodyRef}>
          <TableRow>
            <TableCell ref={cellRef}>John</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(tableRef.current).toBeInstanceOf(HTMLTableElement);
    expect(headerRef.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(bodyRef.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(rowRef.current).toBeInstanceOf(HTMLTableRowElement);
    expect(headRef.current).toBeInstanceOf(HTMLTableCellElement);
    expect(cellRef.current).toBeInstanceOf(HTMLTableCellElement);
  });
});