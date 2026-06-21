import fs from "fs";
import { parse } from 'csv-parse/sync';

export class CSVHandling {
  

  /** *
   * Read the CSV file
   * @param filePath
   * @returns array of object
   */
  static readCSVFile(filePath: string): any[] {
    const csvDataStr = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const csvDataArr = parse(csvDataStr, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return csvDataArr;
  }
}