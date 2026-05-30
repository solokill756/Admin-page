import { useState, useRef } from "react";
import { AdminFoodFormValues } from "../types/adminFood.types";
import { adminFoodsApi } from "../api/adminFoodsApi";

type ParsedRow = {
  data: AdminFoodFormValues;
  isValid: boolean;
  errors: string[];
  rawLine: string;
};

type FoodImportModalProps = {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const REQUIRED_HEADERS = [
  "foodName",
  "servingUnit",
  "servingSize",
  "calories",
  "proteinG",
  "totalCarbohydratesG",
  "totalFatG"
];

const OPTIONAL_HEADERS = [
  "category",
  "fiberG",
  "sodiumMg",
  "saturatedFatG",
  "cholesterolMg",
  "sugarsG",
  "potassiumMg",
  "calciumMg",
  "ironMg",
  "magnesiumMg",
  "phosphorusMg",
  "zincMg",
  "vitaminAUg",
  "vitaminCMg",
  "vitaminDUg",
  "vitaminEMg",
  "vitaminKUg",
  "vitaminB6Mg",
  "vitaminB12Ug",
  "folateDfeUg"
];

export function FoodImportModal({ onClose, onSuccess, onRefresh }: FoodImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate and download sample CSV Template with all columns
  function handleDownloadTemplate() {
    const csvContent = [
      [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS].join(","),
      "Apple,g,100,52,0.3,13.8,0.2,Fruit,2.4,1,0,0,10.4,107,6,0.1,5,11,0,54,4.6,0,0.18,0.5,0.04,0,3",
      "White Rice,g,150,130,2.7,28.7,0.3,Grain,0.4,0,0.1,0,0.1,35,9,0.2,12,37,0.4,0,0,0,0,0,0.07,0,2",
      "Grilled Chicken Breast,g,100,165,31,0,3.6,Meat,0,74,1,85,0,256,15,1,29,228,1,0,0,0.3,0.3,0,0.6,0.3,4"
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "food_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Parse CSV file content
  function parseCSV(text: string): ParsedRow[] {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one food record.");
    }

    // Parse headers
    const headers = lines[0].split(",").map(h => h.trim());
    
    // Check for missing required headers
    const missingHeaders = REQUIRED_HEADERS.filter(req => !headers.includes(req));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV columns: ${missingHeaders.join(", ")}`);
    }

    const headerIndices = headers.reduce((acc, h, i) => {
      acc[h] = i;
      return acc;
    }, {} as Record<string, number>);

    const parsedRows: ParsedRow[] = [];

    // Parse data lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Simple CSV parsing (handling quotes)
      const values: string[] = [];
      let currentVal = "";
      let inQuotes = false;
      
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const rowErrors: string[] = [];
      const getVal = (header: string): string => {
        const index = headerIndices[header];
        return index !== undefined && index < values.length ? values[index] : "";
      };

      const getFloatVal = (header: string): number => {
        const val = getVal(header);
        return val ? parseFloat(val) : 0;
      };

      const foodName = getVal("foodName");
      const servingUnit = getVal("servingUnit");
      const category = getVal("category") || undefined;
      
      const servingSize = parseFloat(getVal("servingSize"));
      const calories = parseFloat(getVal("calories"));
      const proteinG = parseFloat(getVal("proteinG"));
      const totalCarbohydratesG = parseFloat(getVal("totalCarbohydratesG"));
      const totalFatG = parseFloat(getVal("totalFatG"));

      // Validation
      if (!foodName) rowErrors.push("Food name is required");
      if (!servingUnit) rowErrors.push("Serving unit is required");
      if (isNaN(servingSize) || servingSize <= 0) rowErrors.push("Serving size must be a number greater than 0");
      if (isNaN(calories) || calories < 0) rowErrors.push("Calories must be a non-negative number");
      if (isNaN(proteinG) || proteinG < 0) rowErrors.push("Protein must be a non-negative number");
      if (isNaN(totalCarbohydratesG) || totalCarbohydratesG < 0) rowErrors.push("Carbohydrates must be a non-negative number");
      if (isNaN(totalFatG) || totalFatG < 0) rowErrors.push("Fat must be a non-negative number");

      const data: AdminFoodFormValues = {
        foodName,
        servingUnit,
        category,
        servingSize: isNaN(servingSize) ? 0 : servingSize,
        calories: isNaN(calories) ? 0 : calories,
        proteinG: isNaN(proteinG) ? 0 : proteinG,
        totalCarbohydratesG: isNaN(totalCarbohydratesG) ? 0 : totalCarbohydratesG,
        totalFatG: isNaN(totalFatG) ? 0 : totalFatG,
        fiberG: getFloatVal("fiberG"),
        sodiumMg: getFloatVal("sodiumMg"),
        saturatedFatG: getFloatVal("saturatedFatG"),
        cholesterolMg: getFloatVal("cholesterolMg"),
        sugarsG: getFloatVal("sugarsG"),
        potassiumMg: getFloatVal("potassiumMg"),
        calciumMg: getFloatVal("calciumMg"),
        ironMg: getFloatVal("ironMg"),
        magnesiumMg: getFloatVal("magnesiumMg"),
        phosphorusMg: getFloatVal("phosphorusMg"),
        zincMg: getFloatVal("zincMg"),
        vitaminAUg: getFloatVal("vitaminAUg"),
        vitaminCMg: getFloatVal("vitaminCMg"),
        vitaminDUg: getFloatVal("vitaminDUg"),
        vitaminEMg: getFloatVal("vitaminEMg"),
        vitaminKUg: getFloatVal("vitaminKUg"),
        vitaminB6Mg: getFloatVal("vitaminB6Mg"),
        vitaminB12Ug: getFloatVal("vitaminB12Ug"),
        folateDfeUg: getFloatVal("folateDfeUg"),
        isVerified: true
      };

      parsedRows.push({
        data,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        rawLine: line
      });
    }

    return parsedRows;
  }

  // Handle file selection
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        setRows(parsed);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Error parsing CSV file");
        setRows([]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Error reading CSV file");
      setIsParsing(false);
    };
    reader.readAsText(selectedFile);
  }

  // Submit valid rows sequentially to prevent server rate limiting
  async function handleImport() {
    const validRows = rows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus(`Importing 0 / ${validRows.length}...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await adminFoodsApi.create(row.data);
        successCount++;
      } catch (err) {
        console.error(`Failed to import row: ${row.data.foodName}`, err);
        failCount++;
      }
      const progress = Math.round(((i + 1) / validRows.length) * 100);
      setImportProgress(progress);
      setImportStatus(`Importing ${i + 1} / ${validRows.length}...`);
    }

    setIsImporting(false);
    onRefresh();
    onSuccess(`Successfully imported ${successCount} foods! ${failCount > 0 ? `Failed: ${failCount}` : ""}`);
    onClose();
  }

  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="food-modal import-modal" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
        <div className="modal-header">
          <div>
            <p className="section-kicker">Bulk Action</p>
            <h2 id="import-modal-title">Import Foods from CSV</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close" disabled={isImporting}>x</button>
        </div>

        <div className="import-content">
          <div className="template-box">
            <div>
              <h4>Download CSV Sample Template</h4>
              <p>Please download the sample CSV template to ensure correct column naming and structure.</p>
            </div>
            <button className="secondary-button" type="button" onClick={handleDownloadTemplate} disabled={isImporting}>
              Download Template
            </button>
          </div>

          <div className="upload-box" onClick={() => !isImporting && fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: "none" }}
              disabled={isImporting}
            />
            {file ? (
              <div className="file-info">
                <strong>📄 {file.name}</strong>
                <span>({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span>Click here or select a .csv file to upload</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="dashboard-error form-error" role="alert" style={{ marginTop: "16px" }}>
              <strong>Error reading template:</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          {isParsing && <p className="state-copy">Analyzing CSV file content...</p>}

          {rows.length > 0 && !isParsing && (
            <div className="preview-section">
              <div className="preview-summary">
                <span className="valid-badge">✓ {validCount} Valid</span>
                {invalidCount > 0 && <span className="invalid-badge">✗ {invalidCount} Invalid</span>}
              </div>

              <div className="preview-table-container">
                <table className="category-table preview-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Food Name</th>
                      <th>Serving</th>
                      <th>Calories</th>
                      <th>Macros (P/C/F)</th>
                      <th>Error Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? "row-valid" : "row-invalid"}>
                        <td className="status-cell">
                          {row.isValid ? (
                            <span className="text-success">✓ Valid</span>
                          ) : (
                            <span className="text-danger">✗ Error</span>
                          )}
                        </td>
                        <td className="food-name-cell">{row.data.foodName || "—"}</td>
                        <td>{row.data.servingSize} {row.data.servingUnit}</td>
                        <td>{row.data.calories} kcal</td>
                        <td>{row.data.proteinG}g / {row.data.totalCarbohydratesG}g / {row.data.totalFatG}g</td>
                        <td 
                          className={`error-cell ${expandedRowIdx === idx ? "expanded" : ""}`}
                          onClick={() => !row.isValid && setExpandedRowIdx(expandedRowIdx === idx ? null : idx)}
                          title={row.isValid ? undefined : "Click to view full error info"}
                        >
                          {row.isValid ? "—" : row.errors.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isImporting && (
            <div className="import-progress-box">
              <strong>{importStatus}</strong>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${importProgress}%` }} />
              </div>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: "20px" }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={isImporting}>
              Cancel
            </button>
            <button 
              type="button" 
              className="primary-button" 
              disabled={isImporting || validCount === 0} 
              onClick={handleImport}
            >
              {isImporting ? "Importing..." : `Import ${validCount} foods`}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
