import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbar,
  GridFilterModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { Box, CircularProgress, Typography } from "@mui/material";
import useSWR from "swr";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { api } from "@/lib/api";

interface Meta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse<T> {
  data: {
    meta: Meta;
    items: T[];
  };
}

export interface PaginatedDataGridHandle {
  refetch: () => void;
}

interface PaginatedDataGridProps<T> {
  endpoint: string;
  columns: GridColDef[];
  getRowId?: (row: T) => string | number;
}

function buildSortQuery(model: GridSortModel): Record<string, string> {
  const sort: Record<string, string> = {};

  if (model.length > 0) {
    sort.sortBy = model[0].field;
    sort.sortOrder = model[0].sort || "asc";
  }

  return sort;
}

export function PaginatedDataGridInner<T>(
  { endpoint, columns, getRowId }: PaginatedDataGridProps<T>,
  ref: React.Ref<PaginatedDataGridHandle>
) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const queryParams = new URLSearchParams({
    page: String(paginationModel.page + 1),
    limit: String(paginationModel.pageSize),
    ...buildSortQuery(sortModel),
  }).toString();

  const urlMouted = `${endpoint}?${queryParams}`;

  const { data, isLoading, error, mutate } = useSWR<PaginatedResponse<T>>(
    urlMouted,
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useImperativeHandle(ref, () => ({
    refetch: () => {
      console.log("aqui");
      mutate();
    },
  }));

  if (error)
    return (
      <Typography color="error" variant="body1">
        Erro ao carregar dados.
      </Typography>
    );

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      {isLoading && (!data || !data.data.items.length) ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={data?.data.items || []}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={data?.data.meta.total || 0}
          pageSizeOptions={[5, 10, 25, 50]}
          loading={isLoading}
          getRowId={getRowId}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          showToolbar
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              printOptions: { disableToolbarButton: false },
              csvOptions: { disableToolbarButton: false },
              showQuickFilter: true,
              quickFilterProps: {
                quickFilterParser: (searchInput: string) =>
                  searchInput
                    .split(",")
                    .map((value) => value.trim())
                    .filter((value) => value !== ""),
              },
            },
          }}
        />
      )}
    </Box>
  );
}

export const PaginatedDataGrid = forwardRef(PaginatedDataGridInner) as <T>(
  props: PaginatedDataGridProps<T> & {
    ref?: React.Ref<PaginatedDataGridHandle>;
  }
) => ReturnType<typeof PaginatedDataGridInner>;

export default PaginatedDataGrid;
