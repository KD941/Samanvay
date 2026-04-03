import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface TestData {
  id: number;
  name: string;
  email: string;
}

describe('DataTable', () => {
  const mockData: TestData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const columns: ColumnDef<TestData>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ];

  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={columns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable data={mockData} columns={columns} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows pagination controls', () => {
    render(<DataTable data={mockData} columns={columns} />);
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
