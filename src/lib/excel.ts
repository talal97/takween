import writeExcelFile, { type Row } from "write-excel-file/node";

type Column = { header: string; key: string; width: number };

/** Keep exported text as strings, including values beginning with formula characters. */
export async function writeWorkbook(
  sheet: string,
  columns: Column[],
  rows: Record<string, string | number>[],
) {
  const data: Row[] = [
    columns.map(({ header }) => ({ value: header, type: String, fontWeight: "bold" })),
    ...rows.map((row) => columns.map(({ key }) => {
      const value = row[key] ?? "";
      return typeof value === "number" ? { value, type: Number } : { value, type: String };
    })),
  ];
  return writeExcelFile(data, { sheet, columns: columns.map(({ width }) => ({ width })) }).toBuffer();
}
