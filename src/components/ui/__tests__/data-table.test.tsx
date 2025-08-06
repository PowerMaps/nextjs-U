import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, createSortableHeader, createActionColumn, createSelectColumn } from '../data-table';

// Mock data for testing
interface TestData {
  id: string;
  name: string;
  email: string;
  status: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

const basicColumns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

describe('DataTable Component', () => {
  it('renders table with data correctly', () => {
    render(<DataTable columns={basicColumns} data={mockData} />);

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('displays search input when searchKey is provided', () => {
    render(
      <DataTable
        columns={basicColumns}
        data={mockData}
        searchKey="name"
        searchPlaceholder="Search names..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search names...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters data when search input is used', async () => {
    render(
      <DataTable
        columns={basicColumns}
        data={mockData}
        searchKey="name"
        searchPlaceholder="Search names..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search names...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });
  });

  it('shows column visibility dropdown', () => {
    render(<DataTable columns={basicColumns} data={mockData} />);

    const columnsButton = screen.getByText('Columns');
    expect(columnsButton).toBeInTheDocument();
  });

  it('shows pagination controls', () => {
    render(<DataTable columns={basicColumns} data={mockData} />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText(/row\(s\) selected/)).toBeInTheDocument();
  });

  it('displays "No results" when data is empty', () => {
    render(<DataTable columns={basicColumns} data={[]} />);

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('handles pagination correctly', async () => {
    // Create more data to test pagination
    const largeData = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
    }));

    render(<DataTable columns={basicColumns} data={largeData} />);

    // Should show first 10 rows by default
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 10')).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();

    // Click next page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('User 11')).toBeInTheDocument();
      expect(screen.getByText('User 15')).toBeInTheDocument();
      expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });
  });
});

describe('DataTable Helper Functions', () => {
  it('createSortableHeader creates sortable column header', () => {
    const mockColumn = {
      toggleSorting: jest.fn(),
      getIsSorted: jest.fn().mockReturnValue(false),
    };

    const SortableHeader = createSortableHeader('Test Column');
    render(<SortableHeader column={mockColumn} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Test Column');

    fireEvent.click(button);
    expect(mockColumn.toggleSorting).toHaveBeenCalledWith(false);
  });

  it('createActionColumn creates action dropdown', () => {
    const mockActions = [
      { label: 'Edit', onClick: jest.fn() },
      { label: 'Delete', onClick: jest.fn() },
    ];

    const actionColumn = createActionColumn(mockActions);
    const mockRow = { original: { id: '1', name: 'Test' } };

    const ActionCell = actionColumn.cell;
    render(<ActionCell row={mockRow} />);

    // Should render the action button
    const actionButton = screen.getByRole('button');
    expect(actionButton).toBeInTheDocument();
  });

  it('createSelectColumn creates checkbox column', () => {
    const mockTable = {
      getIsAllPageRowsSelected: jest.fn().mockReturnValue(false),
      getIsSomePageRowsSelected: jest.fn().mockReturnValue(false),
      toggleAllPageRowsSelected: jest.fn(),
    };

    const selectColumn = createSelectColumn();
    const HeaderCheckbox = selectColumn.header;
    render(<HeaderCheckbox table={mockTable} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(mockTable.toggleAllPageRowsSelected).toHaveBeenCalledWith(true);
  });
});