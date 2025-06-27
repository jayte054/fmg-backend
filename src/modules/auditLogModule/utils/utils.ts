import { LogInterface, PaginatedLogResponse } from './logInterface';

export const paginatedLog = async (
  logInterface: LogInterface,
): Promise<PaginatedLogResponse> => {
  const { logs, total, skip, take } = logInterface;

  return {
    data: logs,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
  };
};
