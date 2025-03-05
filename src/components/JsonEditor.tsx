
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatJsonForExport, convertInternalToRawFormat } from "@/utils/annotation-utils";
import { Dataset, RawAnnotationDataset, convertRawToInternalFormat } from "@/types/annotation";
import { Save, Download, Upload, Clipboard, Code } from "lucide-react";

interface JsonEditorProps {
  dataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ dataset, onDatasetChange }) => {
  const [jsonText, setJsonText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Convert to the raw format when displaying
    const rawFormat = convertInternalToRawFormat(dataset);
    setJsonText(formatJsonForExport(rawFormat));
  }, [dataset]);

  const handleSaveClick = () => {
    try {
      const parsedData = JSON.parse(jsonText) as RawAnnotationDataset;
      
      // Check if this is a raw format (with annotation.bboxes)
      if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].annotation && parsedData[0].annotation.bboxes) {
        const convertedData = convertRawToInternalFormat(parsedData);
        onDatasetChange(convertedData);
      } 
      // Assume it's our internal format or handle accordingly
      else if (parsedData.images && Array.isArray(parsedData.images)) {
        onDatasetChange(parsedData);
      } else {
        toast.error("Invalid JSON structure");
        return;
      }
      
      setIsEditing(false);
      toast.success("JSON updated successfully");
    } catch (e) {
      toast.error("Invalid JSON format");
    }
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success("Copied to clipboard");
  };

  const handleDownloadClick = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setJsonText(formatJsonForExport(json));
          onDatasetChange(json);
          toast.success("JSON file loaded successfully");
        } catch (e) {
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Annotation Data</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveClick}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1"
              >
                <Code className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyClick}
                className="flex items-center gap-1"
              >
                <Clipboard className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadClick}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              readOnly={!isEditing}
              className="font-mono text-sm h-full resize-none border-0 p-4 focus-visible:ring-0"
              style={{ minHeight: "300px" }}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonEditor;
