import { PaginatedTemplateFilter, PaginatedTemplateResponse } from './types';

export const paginatedTemplates = async (
  paginatedTemplateFilter: PaginatedTemplateFilter,
): Promise<PaginatedTemplateResponse> => {
  return {
    templates: paginatedTemplateFilter.templates,
    total: paginatedTemplateFilter.total,
    page:
      Math.floor(paginatedTemplateFilter.skip / paginatedTemplateFilter.take) +
      1,
    perPage: paginatedTemplateFilter.take,
  };
};
