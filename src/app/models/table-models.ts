export interface Column<T> {
  title: string;
  value: (obj: T) => string;
}
