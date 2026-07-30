"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType, NodeType } from "@prisma/client";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Link2Icon,
  Loader2Icon,
  PlusIcon,
  TableIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { SaveTemplateButton } from "@/components/save-template-button";
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
import { cn } from "@/lib/utils";
import { VariablePicker } from "@/components/variable-picker";
import { NodeOutputHint } from "@/components/node-output-hint";

// ============================================
// TYPES
// ============================================

type AppendRowData = Record<string, string>;

const formSchema = z.object({
  variableName: z.string().min(1, "Nama variabel wajib diisi"),
  credentialId: z.string().min(1, "Credential wajib dipilih"),
  operation: z.enum(["append"]),
  spreadsheetUrl: z.string().min(1, "URL Spreadsheet wajib diisi").optional(),
  spreadsheetId: z.string().min(1, "Spreadsheet ID wajib diisi"),
  range: z.string().min(1, "Range wajib diisi"),
  appendData: z.string().optional(),
});

export type GoogleSheetsFormValues = z.infer<typeof formSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

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

function formatRange(
  sheetName: string,
  startCol?: string,
  endCol?: string,
): string {
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
      <div className={cn("text-xs text-muted-foreground p-3 text-center border border-dashed rounded-lg", className)}>
        Tidak ada data untuk di-preview
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      <div className="bg-muted/50 px-3 py-2 border-b flex items-center gap-2">
        <TableIcon className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Preview Kolom
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap text-xs uppercase tracking-wider"
                >
                  {col || `Kolom ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          {sampleData && sampleData.length > 0 && (
            <tbody>
              {sampleData.slice(0, 3).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                >
                  {columns.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-2 text-muted-foreground whitespace-nowrap text-xs font-mono"
                    >
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
  nodeId: string;
}

function VisualAppendForm({ columns, value, onChange, nodeId }: VisualAppendFormProps) {
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
    <div className="space-y-4">
      {columns.map((column) => (
        <div key={column} className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32 shrink-0 truncate sm:text-right">
            {column}
          </label>
          <div className="flex gap-2 flex-1">
            <Input
              value={value[column] || ""}
              onChange={(e) => handleChange(column, e.target.value)}
              placeholder={`Nilai untuk ${column}`}
              className="flex-1 font-mono text-sm"
            />
            <VariablePicker
              nodeId={nodeId}
              onSelect={(val) => {
                handleChange(column, (value[column] || "") + val);
              }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground">
          Gunakan ikon {"{}"} untuk mengambil data dinamis dari node sebelumnya secara otomatis.
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

function SheetSelector({
  spreadsheetId,
  credentialId,
  value,
  onChange,
  onColumnsChange,
}: SheetSelectorProps) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spreadsheetId || !credentialId) {
      setSheets([]);
      return;
    }

    const fetchSheets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/google-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId,
            spreadsheetId,
            action: "get_sheets",
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.error || "Gagal mengambil daftar sheet");
          setSheets([]);
          return;
        }

        const data = await res.json();
        const sheetNames =
          data.sheets?.map((s: any) => s.properties.title) || [];
        setSheets(sheetNames);

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

  useEffect(() => {
    if (!spreadsheetId || !credentialId || !value) {
      onColumnsChange([]);
      return;
    }

    const fetchPreview = async () => {
      try {
        const res = await fetch("/api/google-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId,
            spreadsheetId,
            range: value,
            action: "get_preview",
          }),
        });

        if (!res.ok) {
          onColumnsChange([]);
          return;
        }

        const data = await res.json();
        onColumnsChange(data.columns || [], data.sampleData);
      } catch (err) {
        console.error("Error fetching preview:", err);
        onColumnsChange([]);
      }
    };

    fetchPreview();
  }, [spreadsheetId, credentialId, value]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md border-dashed">
        <Loader2Icon className="size-4 animate-spin text-green-600" />
        Memuat daftar sheet...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive p-2 border border-destructive/20 bg-destructive/10 rounded-md">⚠️ {error}</div>;
  }

  if (sheets.length === 0 && spreadsheetId) {
    return (
      <div className="text-sm text-muted-foreground p-2 border border-dashed rounded-md">
        Tidak ada sheet ditemukan
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-background border-input">
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
  nodeId: string;
}

export const GoogleSheetsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.GOOGLE);

  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<string[][] | undefined>();
  const [appendFormData, setAppendFormData] = useState<Record<string, string>>(
    {},
  );

  const defaultUrl = defaultValues.spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${defaultValues.spreadsheetId}/edit`
    : "";

  const form = useForm<GoogleSheetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "sheetData",
      credentialId: defaultValues.credentialId || "",
      operation: "append",
      spreadsheetUrl: defaultUrl,
      spreadsheetId: defaultValues.spreadsheetId || "",
      range: defaultValues.range || "Sheet1",
      appendData: defaultValues.appendData || "{}",
    },
  });

  useEffect(() => {
    if (open) {
      const url = defaultValues.spreadsheetId
        ? `https://docs.google.com/spreadsheets/d/${defaultValues.spreadsheetId}/edit`
        : "";

      form.reset({
        variableName: defaultValues.variableName || "sheetData",
        credentialId: defaultValues.credentialId || "",
        operation: "append",
        spreadsheetUrl: url,
        spreadsheetId: defaultValues.spreadsheetId || "",
        range: defaultValues.range || "Sheet1",
        appendData: defaultValues.appendData || "{}",
      });

      setColumns([]);
      setSampleData(undefined);
      try {
        setAppendFormData(
          defaultValues.appendData ? JSON.parse(defaultValues.appendData) : {},
        );
      } catch (e) {
        setAppendFormData({});
      }
    }
  }, [open, form, defaultValues]);

  const operation = form.watch("operation");
  const spreadsheetUrl = form.watch("spreadsheetUrl");
  const credentialId = form.watch("credentialId");
  const range = form.watch("range");

  const handleUrlChange = (url: string) => {
    form.setValue("spreadsheetUrl", url);

    const extractedId = extractSpreadsheetId(url);
    if (extractedId) {
      form.setValue("spreadsheetId", extractedId);
      form.setValue("range", "Sheet1");
    } else {
      form.setValue("spreadsheetId", "");
    }
  };

  const handleSheetChange = (sheetName: string) => {
    form.setValue("range", sheetName);
  };

  const handleColumnsChange = (
    newColumns: string[],
    newSampleData?: string[][],
  ) => {
    setColumns(newColumns);
    setSampleData(newSampleData);

    setAppendFormData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (!newColumns.includes(key)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const handleAppendFormChange = (data: Record<string, string>) => {
    setAppendFormData(data);
    form.setValue("appendData", JSON.stringify(data));
  };

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    const orderedValues = columns.map((col) => appendFormData[col] || "");

    const finalValues = {
      ...values,
      values:
        operation === "append" ? JSON.stringify([orderedValues]) : undefined,
    };
    onSubmit(finalValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl">Google Sheets</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Baca atau tambahkan data ke Google Sheets dengan mudah.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Koneksi & Target Data
                </h4>
                
                <FormField
                  control={form.control}
                  name="credentialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Credential Google</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
                              <a
                                href="/credentials/new"
                                className="text-primary hover:underline ml-1"
                              >
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

                <FormField
                  control={form.control}
                  name="spreadsheetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        URL Spreadsheet
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="font-mono text-sm"
                          {...field}
                          onChange={(e) => handleUrlChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Tempel URL Google Sheets Anda. ID akan otomatis diekstrak.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {spreadsheetUrl && credentialId && (
                  <div className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Sheet
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
                
                {columns.length > 0 && (
                  <div className="pt-2">
                    <ColumnPreview
                      columns={columns}
                      sampleData={sampleData}
                      className="border-dashed"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-2 font-medium mb-4 text-emerald-600 dark:text-emerald-400">
                  <PlusIcon className="size-4" />
                  <span>Data yang akan ditambahkan</span>
                </div>
                <VisualAppendForm
                  columns={columns}
                  value={appendFormData}
                  onChange={handleAppendFormChange}
                  nodeId={nodeId}
                />
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-4">
                <FormField
                  control={form.control}
                  name="variableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Nama Variabel Output
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="sheetData" 
                          className="font-mono text-sm max-w-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Data hasil operasi ini akan disimpan dalam nama variabel di atas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <NodeOutputHint nodeType={NodeType.GOOGLE_SHEETS} />
              </div>

              <input type="hidden" {...form.register("spreadsheetId")} />
              <input type="hidden" {...form.register("range")} />
              <input type="hidden" {...form.register("appendData")} />

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
                <SaveTemplateButton
                  nodeType={NodeType.GOOGLE_SHEETS}
                  currentConfig={form.getValues()}
                />
                <Button type="submit" disabled={!form.formState.isValid} className="px-6 font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
                  Simpan Pengaturan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
