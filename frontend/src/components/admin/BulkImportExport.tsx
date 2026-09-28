// File: /components/admin/BulkImportExport.tsx
import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '../../hooks/use-toast';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportExport: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [file, setFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [exportFilters, setExportFilters] = useState({
    includeInactive: false,
    includeLowStock: true,
    category: 'all'
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file',
          description: 'Please select a CSV file',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/products/admin/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) throw new Error('Import failed');

      const data = await response.json();
      
      setImportResults({
        success: data.successCount || 0,
        failed: data.failedCount || 0,
        errors: data.errors || []
      });

      if (data.successCount > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${data.successCount} products`
        });
        onSuccess();
      }

      if (data.failedCount > 0) {
        toast({
          title: 'Partial Import',
          description: `${data.failedCount} products failed to import`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: 'Import Failed',
        description: 'Failed to import products. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Preparing your export file...'
    });

    // Generate download link
    const csvContent = "data:text/csv;charset=utf-8,SKU,Name,Category,Price,Stock,Brand,Description\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const template = `SKU,Name,Category,Price,Stock,Description,Brand,LowStockThreshold,IsActive,IsFeatured
PROD001,Organic Apples,Fruits & Vegetables,2.99,100,"Fresh organic apples","Organic Farms",10,true,false
PROD002,Whole Wheat Bread,Bakery,3.49,50,"Fresh whole wheat bread","Bakery Co",5,true,true
PROD003,Milk,Dairy,1.99,30,"Fresh milk 1 gallon","Dairy Fresh",10,true,false
PROD004,Eggs,Dairy,4.99,20,"Large brown eggs 12 pack","Farm Fresh",5,true,true
PROD005,Chicken Breast,Meat & Poultry,8.99,15,"Boneless chicken breast 1lb","Fresh Meat",10,true,false

Instructions:
1. Required fields: SKU, Name, Category, Price, Stock
2. Category must match existing category names
3. Price and Stock must be numbers
4. IsActive and IsFeatured: use true/false
5. Keep column order as shown`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImport = () => {
    setFile(null);
    setImportResults(null);
    setImportProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import/Export</DialogTitle>
          <DialogDescription>
            Import products from CSV or export your product catalog
          </DialogDescription>
        </DialogHeader>

        {/* TABS */}
        <div className="border-b">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'import' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('import')}
            >
              Import Products
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'export' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('export')}
            >
              Export Products
            </button>
          </div>
        </div>

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-6 py-4">
            {/* TEMPLATE DOWNLOAD */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold">Download Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Use our template to ensure proper formatting. Includes sample data and instructions.
                  </p>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>

            {/* FILE UPLOAD */}
            <div>
              <h3 className="font-semibold mb-3">Upload CSV File</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearImport}>
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium">Drag & drop your CSV file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                    <div>
                      <input
                        type="file"
                        id="csv-upload"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="csv-upload">
                        <Button asChild variant="outline">
                          <span>Select File</span>
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supported format: CSV (Max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* IMPORT PROGRESS */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing products...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}

            {/* IMPORT RESULTS */}
            {importResults && !isImporting && (
              <div className={`p-4 rounded-lg ${importResults.failed > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <div className="flex items-start gap-3">
                  {importResults.failed > 0 ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {importResults.failed > 0 ? 'Partial Import Complete' : 'Import Successful'}
                    </h3>
                    <p className="text-sm mb-2">
                      Successfully imported <strong>{importResults.success}</strong> products.
                      {importResults.failed > 0 && (
                        <> <strong>{importResults.failed}</strong> products failed to import.</>
                      )}
                    </p>
                    {importResults.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Errors:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {importResults.errors.slice(0, 3).map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                          {importResults.errors.length > 3 && (
                            <li className="text-gray-500">
                              ...and {importResults.errors.length - 3} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VALIDATION INFO */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• First row must contain column headers</li>
                <li>• Required columns: SKU, Name, Category, Price, Stock</li>
                <li>• Category must exactly match existing category names</li>
                <li>• Price and Stock must be valid numbers</li>
                <li>• Use quotes for text containing commas</li>
              </ul>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-6 py-4">
            {/* EXPORT FORMAT */}
            <div>
              <h3 className="font-semibold mb-3">Export Format</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${exportFormat === 'csv' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setExportFormat('csv')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <div>
                      <p className="font-medium">CSV Format</p>
                      <p className="text-sm text-gray-500">Comma separated values</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${exportFormat === 'excel' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setExportFormat('excel')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Excel Format</p>
                      <p className="text-sm text-gray-500">Microsoft Excel (.xlsx)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPORT OPTIONS */}
            <div>
              <h3 className="font-semibold mb-3">Export Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Include Inactive Products</p>
                    <p className="text-sm text-gray-500">Products marked as inactive</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportFilters.includeInactive}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      includeInactive: e.target.checked
                    }))}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Include Low Stock Items</p>
                    <p className="text-sm text-gray-500">Products below threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportFilters.includeLowStock}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      includeLowStock: e.target.checked
                    }))}
                    className="w-5 h-5"
                  />
                </div>
                <div>
                  <p className="font-medium mb-2">Filter by Category</p>
                  <select
                    value={exportFilters.category}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Categories</option>
                    <option value="fruits">Fruits & Vegetables</option>
                    <option value="dairy">Dairy</option>
                    <option value="bakery">Bakery</option>
                    <option value="meat">Meat & Poultry</option>
                  </select>
                </div>
              </div>
            </div>

            {/* EXPORT PREVIEW */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Export will include:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product ID and SKU</li>
                <li>• Name, Description, and Category</li>
                <li>• Price, Stock, and Cost</li>
                <li>• Brand and Supplier information</li>
                <li>• Product images (as URLs)</li>
                <li>• Created and Updated timestamps</li>
              </ul>
            </div>
          </div>
        )}

        {/* FOOTER BUTTONS */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 'import' ? (
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Start Import'
              )}
            </Button>
          ) : (
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Products
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportExport;