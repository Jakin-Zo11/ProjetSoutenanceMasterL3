import React from 'react';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, onRowClick }) => {
  return (
    <div className="bg-white rounded-xl border border-[#DDEAF7] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F0F5FB] border-b border-[#DDEAF7]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-[#637799] uppercase tracking-wider"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDEAF7]">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-[#F0F5FB] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 text-sm text-[#0B1D3A]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-[#637799]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Aucune donnée disponible
          </p>
        </div>
      )}
    </div>
  );
};

export default Table;
