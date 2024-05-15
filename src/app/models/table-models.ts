export const COLUMN_CONTENT_TYPES = [
  "string",
  "platformRecordID",
  "checksum"
] as const;

export type ColumnContentType = typeof COLUMN_CONTENT_TYPES[number];

export interface Column<T> {
  title: string;
  contentType: ColumnContentType;
  value: (obj: T) => string|null;
}
