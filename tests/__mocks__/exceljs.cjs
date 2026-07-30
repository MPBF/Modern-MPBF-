// Minimal stub so Jest never tries to load the real exceljs (which pulls in uuid v14 ESM)
class MockWorkbook {
  constructor() {
    this.xlsx = {
      load: () => Promise.resolve(),
      writeBuffer: () => Promise.resolve(Buffer.from("")),
    };
    this.csv = { readFile: () => Promise.resolve() };
    this.worksheets = [];
  }
  addWorksheet(name) {
    const ws = { name, columns: [], addRow: () => {}, eachRow: () => {} };
    this.worksheets.push(ws);
    return ws;
  }
}
module.exports = MockWorkbook;
module.exports.default = MockWorkbook;
module.exports.Workbook = MockWorkbook;
