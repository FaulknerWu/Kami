export function parsePageParam(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate ?? "1");

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function buildPageHref(pathname: string, page: number) {
  if (page <= 1) {
    return pathname;
  }

  return `${pathname}?page=${page}`;
}
