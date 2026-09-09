"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Copy, Eye } from "lucide-react";
import { JSX } from "react";
import { toast } from "sonner";

interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev?: string;
  [key: string]: any;
}

interface DataViewerProps {
  document: SanityDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DataViewer = ({
  document,
  open,
  onOpenChange,
}: DataViewerProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderValue = (key: string, value: any): JSX.Element => {
    if (key.startsWith("_")) {
      return (
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {key}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(formatValue(value))}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <code className="text-xs text-gray-700 font-mono">
            {formatValue(value)}
          </code>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <Card className="mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              {key}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(JSON.stringify(value, null, 2))}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {Array.isArray(value)
              ? value.map((item, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <strong>[{index}]:</strong> {formatValue(item)}
                  </div>
                ))
              : Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey}>{renderValue(subKey, subValue)}</div>
                ))}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="p-3 bg-white border rounded-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{key}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(formatValue(value))}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <div className="text-sm text-gray-900">
          {key.toLowerCase().includes("date") ? (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(value).toLocaleString()}
            </div>
          ) : key.toLowerCase().includes("url") ||
            key.toLowerCase().includes("link") ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {value}
            </a>
          ) : key.toLowerCase().includes("email") ? (
            <a
              href={`mailto:${value}`}
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            <span
              className={value && value.length > 100 ? "font-mono text-xs" : ""}
            >
              {formatValue(value)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            View Document
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline">{document._type}</Badge>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {document._id}
            </code>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Document Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Created</span>
                    <p className="text-sm font-mono">
                      {new Date(document._createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Updated</span>
                    <p className="text-sm font-mono">
                      {new Date(document._updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {document._rev && (
                  <div>
                    <span className="text-xs text-gray-500">Revision</span>
                    <p className="text-sm font-mono">{document._rev}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Document Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(document)
                  .filter(([key]) => !key.startsWith("_"))
                  .map(([key, value]) => (
                    <div key={key}>{renderValue(key, value)}</div>
                  ))}
              </CardContent>
            </Card>

            {/* Raw JSON */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Raw JSON Data
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(document, null, 2))
                    }
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy JSON
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(document, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
