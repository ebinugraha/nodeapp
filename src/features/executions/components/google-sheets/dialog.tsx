"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, Trash2Icon, Link2Icon, TableIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import z from "zod";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

// New improved format for append values (array of objects)
type AppendRowData = Record<string, string>;

const formSchema = z.object({
  variableName: z.string().min(1, "Nama variabel wajib diisi"),
  credentialId: z.string().min(1, "Credential wajib dipilih"),
  operation: z.enum(["read", "append"]),
  spreadsheetUrl: z.string().min(1, "URL Spreadsheet wajib diisi").optional(), // NEW: URL instead of ID
  spreadsheetId: z.string().min(1, "Spreadsheet ID wajib diisi"),
  range: z.string().min(1, "Range wajib diisi"),
  // NEW: For visual append form
  appendData: z.string().optional(), // JSON string of AppendRowData[]
});

export type GoogleSheetsFormValues = z.infer<typeof formSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract spreadsheet ID from Google Sheets URL
 * Supports formats:
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/view
 */
function extractSpreadsheetId(url: string): string | null {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\//,
    /key=([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Format range string for Google Sheets API
 */
function formatRange(sheetName: string, startCol?: string, endCol?: string): string {
  if (startCol && endCol) {
    return `${sheetName}!${startCol}:${endCol}`;
  }
  return sheetName;
}

// ============================================
// COLUMN PREVIEW COMPONENT
// ============================================

interface ColumnPreviewProps {
  columns: string[];
  sampleData?: string[][];
  className?: string;
}

function ColumnPreview({ columns, sampleData, className }: ColumnPreviewProps) {
  if (columns.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Tidak ada data untuk di-preview
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      <div className="bg-muted/50 px-3 py-2 border-b flex items-center gap-2">
        <TableIcon className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Preview Kolom</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {col || `Kolom ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          {sampleData && sampleData.length > 0 && (
            <tbody>
              {sampleData.slice(0, 3).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0 hover:bg-muted/20">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {row[colIndex] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

// ============================================
// VISUAL APPEND FORM COMPONENT
// ============================================

interface VisualAppendFormProps {
  columns: string[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

function VisualAppendForm({ columns, value, onChange }: VisualAppendFormProps) {
  const handleChange = (column: string, newValue: string) => {
    onChange({
      ...value,
      [column]: newValue,
    });
  };

  if (columns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg border-dashed">
        Masukkan URL spreadsheet terlebih dahulu untuk melihat kolom
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">
        Masukkan nilai untuk setiap kolom:
      </div>
      {columns.map((column) => (
        <div key={column} className="flex items-center gap-3">
          <label className="text-sm font-medium w-32 shrink-0 truncate">
            {column}:
          </label>
          <Input
            value={value[column] || ""}
            onChange={(e) => handleChange(column, e.target.value)}
            placeholder={`Nilai untuk ${column}`}
            className="flex-1"
          />
        </div>
      ))}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          💡 Gunakan {"{{variabel}}"} untuk menggunakan nilai dari node sebelumnya.
          Contoh: {"{{input.nama}}"}
        </p>
      </div>
    </div>
  );
}

// ============================================
// SHEET SELECTOR COMPONENT
// ============================================

interface SheetSelectorProps {
  spreadsheetId: string;
  credentialId: string;
  value: string;
  onChange: (value: string) => void;
  onColumnsChange: (columns: string[], sampleData?: string[][]) => void;
}

function SheetSelector({ spreadsheetId, credentialId, value, onChange, onColumnsChange }: SheetSelectorProps) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch sheets when spreadsheetId changes
  useEffect(() => {
    if (!spreadsheetId || !credentialId) {
      setSheets([]);
      return;
    }

    const fetchSheets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get credential from database via API
        const response = await fetch(`/api/credentials/${credentialId}`);
        if (!response.ok) throw new Error("Gagal mengambil credential");

        const credential = await response.json();
        const token = JSON.parse(credential.value).access_token;

        // Fetch spreadsheet metadata to get sheet names
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || "Gagal mengambil daftar sheet");
        }

        const data = await res.json();
        const sheetNames = data.sheets?.map((s: any) => s.properties.title) || [];
        setSheets(sheetNames);

        // Auto-select first sheet if value is empty
        if (!value && sheetNames.length > 0) {
          onChange(sheetNames[0]);
        }
      } catch (err: any) {
        console.error("Error fetching sheets:", err);
        setError(err.message);
        setSheets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, [spreadsheetId, credentialId]);

  // Fetch column preview when selected sheet changes
  useEffect(() => {
    if (!spreadsheetId || !credentialId || !value) {
      onColumnsChange([]);
      return;
    }

    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/credentials/${credentialId}`);
        if (!response.ok) return;

        const credential = await response.json();
        const token = JSON.parse(credential.value).access_token;

        const range = `${value}!A1:Z1`; // Get first row for headers
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          onColumnsChange([]);
          return;
        }

        const data = await res.json();
        const columns = data.values?.[0] || [];

        // Also fetch a few sample rows
        const sampleRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(value)}!A1:Z5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let sampleData: string[][] | undefined;
        if (sampleRes.ok) {
          const sampleJson = await sampleRes.json();
          sampleData = sampleJson.values;
        }

        onColumnsChange(columns, sampleData);
      } catch (err) {
        console.error("Error fetching preview:", err);
        onColumnsChange([]);
      }
    };

    fetchPreview();
  }, [spreadsheetId, credentialId, value]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Memuat daftar sheet...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        ⚠️ {error}
      </div>
    );
  }

  if (sheets.length === 0 && spreadsheetId) {
    return (
      <div className="text-sm text-muted-foreground">
        Tidak ada sheet ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih sheet..." />
        </SelectTrigger>
        <SelectContent>
          {sheets.map((sheet) => (
            <SelectItem key={sheet} value={sheet}>
              {sheet}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================
// MAIN DIALOG COMPONENT
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: GoogleSheetsFormValues) => void;
  defaultValues?: Partial<GoogleSheetsFormValues>;
}

export const GoogleSheetsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.GOOGLE);

  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<string[][] | undefined>();
  const [appendFormData, setAppendFormData] = useState<Record<string, string>>({});

  // Check if URL is being used (for backwards compatibility)
  const defaultUrl = defaultValues.spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${defaultValues.spreadsheetId}/edit`
    : "";

  const form = useForm<GoogleSheetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "sheetData",
      credentialId: defaultValues.credentialId || "",
      operation: defaultValues.operation || "read",
      spreadsheetUrl: defaultUrl,
      spreadsheetId: defaultValues.spreadsheetId || "",
      range: defaultValues.range || "Sheet1",
      appendData: defaultValues.appendData || "{}",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const url = defaultValues.spreadsheetId
        ? `https://docs.google.com/spreadsheets/d/${defaultValues.spreadsheetId}/edit`
        : "";

      form.reset({
        variableName: defaultValues.variableName || "sheetData",
        credentialId: defaultValues.credentialId || "",
        operation: defaultValues.operation || "read",
        spreadsheetUrl: url,
        spreadsheetId: defaultValues.spreadsheetId || "",
        range: defaultValues.range || "Sheet1",
        appendData: defaultValues.appendData || "{}",
      });

      // Reset local state
      setColumns([]);
      setSampleData(undefined);
      setAppendFormData({});
    }
  }, [open, form, defaultValues]);

  const operation = form.watch("operation");
  const spreadsheetUrl = form.watch("spreadsheetUrl");
  const credentialId = form.watch("credentialId");
  const range = form.watch("range");

  // Handle URL change and extract spreadsheet ID
  const handleUrlChange = (url: string) => {
    form.setValue("spreadsheetUrl", url);

    const extractedId = extractSpreadsheetId(url);
    if (extractedId) {
      form.setValue("spreadsheetId", extractedId);
      // Auto-set range to first sheet name (will be updated when sheet is selected)
      form.setValue("range", "Sheet1");
    } else {
      form.setValue("spreadsheetId", "");
    }
  };

  // Handle sheet selection
  const handleSheetChange = (sheetName: string) => {
    form.setValue("range", sheetName);
  };

  // Handle columns change
  const handleColumnsChange = (newColumns: string[], newSampleData?: string[][]) => {
    setColumns(newColumns);
    setSampleData(newSampleData);

    // Reset append form data when columns change
    if (JSON.stringify(Object.keys(appendFormData)) !== JSON.stringify(newColumns)) {
      setAppendFormData({});
    }
  };

  // Handle append form data change
  const handleAppendFormChange = (data: Record<string, string>) => {
    setAppendFormData(data);
    // Convert to JSON string for the form field
    form.setValue("appendData", JSON.stringify(data));
  };

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    // Convert append form data to the format expected by executor
    const finalValues = {
      ...values,
      // For append, convert the visual form data to array format
      values: operation === "append"
        ? JSON.stringify([Object.values(appendFormData)])
        : undefined,
    };
    onSubmit(finalValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0F9D58"/>
              <path d="M2 17L12 22L22 17" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12L12 17L22 12" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Google Sheets
          </DialogTitle>
          <DialogDescription>
            Baca atau tambahkan data ke Google Sheets dengan mudah.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">

            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    📤 Nama Variabel Output
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="sheetData" {...field} />
                  </FormControl>
                  <FormDescription>
                    Referensi hasil: {"{{sheetData.values}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>🔑 Credential Google</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih credential..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.length === 0 && (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          Belum ada credential Google.
                          <a href="/credentials/new" className="text-primary hover:underline ml-1">
                            Buat baru?
                          </a>
                        </div>
                      )}
                      {credentials?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex gap-2 items-center">
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Spreadsheet URL */}
            <FormField
              control={form.control}
              name="spreadsheetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Link2Icon className="size-4" />
                    URL Spreadsheet
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      {...field}
                      onChange={(e) => handleUrlChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Tempel URL Google Sheets Anda. ID akan otomatis diekstrak.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sheet Selector */}
            {spreadsheetUrl && credentialId && (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  📋 Pilih Sheet
                </FormLabel>
                <SheetSelector
                  spreadsheetId={form.watch("spreadsheetId")}
                  credentialId={credentialId}
                  value={range}
                  onChange={handleSheetChange}
                  onColumnsChange={handleColumnsChange}
                />
              </div>
            )}

            {/* Column Preview */}
            {columns.length > 0 && (
              <div className="space-y-2">
                <ColumnPreview
                  columns={columns}
                  sampleData={sampleData}
                  className="border rounded-lg"
                />
              </div>
            )}

            {/* Operation */}
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>⚙️ Operasi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="read">
                        <div className="flex items-center gap-2">
                          <span>📖</span>
                          <span>Baca Baris (Read Rows)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="append">
                        <div className="flex items-center gap-2">
                          <span>➕</span>
                          <span>Tambah Baris (Append Rows)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visual Append Form (Only for Append) */}
            {operation === "append" && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 font-medium">
                  <PlusIcon className="size-4" />
                  <span>Tambah Baris Baru</span>
                </div>
                <VisualAppendForm
                  columns={columns}
                  value={appendFormData}
                  onChange={handleAppendFormChange}
                />
              </div>
            )}

            {/* Hidden field untuk spreadsheetId - digunakan sebagai sumber truth */}
            <input
              type="hidden"
              {...form.register("spreadsheetId")}
            />
            <input
              type="hidden"
              {...form.register("range")}
            />
            <input
              type="hidden"
              {...form.register("appendData")}
            />

            <DialogFooter>
              <Button type="submit" disabled={!form.formState.isValid}>
                💾 Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
