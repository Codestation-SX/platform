export function formatPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number
) {
  const totalPages = Math.ceil(total / perPage);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return {
    data: {
      meta: {
        total,
        page,
        perPage,
        totalPages,
        from,
        to,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      items,
      links: {
        first: `?page=1&limit=${perPage}`,
        last: `?page=${totalPages}&limit=${perPage}`,
        next: page < totalPages ? `?page=${page + 1}&limit=${perPage}` : null,
        prev: page > 1 ? `?page=${page - 1}&limit=${perPage}` : null,
      },
    },
  };
}
