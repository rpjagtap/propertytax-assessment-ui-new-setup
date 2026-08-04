import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';

const DataTable = () => {
  // eslint-disable-next-line no-unused-vars
  const [rows, setRows] = useState([
    { id: 1, name: 'Item 1', price: 100 },
    { id: 2, name: 'Item 2', price: 200 },
    { id: 3, name: 'Item 3', price: 300 },
    { id: 4, name: 'Item 4', price: 400 },
    { id: 5, name: 'Item 5', price: 500 },
    { id: 6, name: 'Item 6', price: 600 },
    { id: 7, name: 'Item 7', price: 700 },
  ]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'price', headerName: 'Price', width: 150 },
    // {
    //   field: 'checkbox',
    //   headerName: 'Select',
    //   width: 150,
    //   renderCell: (params) => <Checkbox checked={params.row.selected} />,
    // },
  ];

  // Pagination is removed, no need for paginationModel or pageSizeOptions.
  return (
    <div>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={rows.length} // Show all rows
        checkboxSelection
        sx={{ border: 0 }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={() => alert('Checkout clicked!')}
      >
        Checkout
      </Button>
    </div>
  );
};

export default DataTable;
