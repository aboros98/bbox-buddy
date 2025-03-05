
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatJsonForExport, convertInternalToRawFormat } from "@/utils/annotation-utils";
import { Dataset, RawAnnotationDataset } from "@/types/annotation";
import { saveDatasetToFile } from "@/utils/electron-file-service";
import { toast } from "sonner";

interface JsonEditorProps {
  dataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ dataset, onDatasetChange }) => {
  const [jsonContent, setJsonContent] = useState(() => {
    const rawData = convertInternalToRawFormat(dataset);
    return formatJsonForExport(rawData);
  });

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
  };

  const handleSaveToFile = async () => {
    const success = await saveDatasetToFile(dataset);
    if (success) {
      toast.success("Dataset saved to file successfully!");
    } else {
      toast.error("Failed to save dataset to file");
    }
  };

  const handleUpdateDataset = () => {
    try {
      const rawData = JSON.parse(jsonContent) as RawAnnotationDataset;
      // This won't work because 'images' doesn't exist on RawAnnotationDataset
      // const newImages = rawData.images.map(img => ({ ...img }));
      // We need to convert the raw data to our internal format first
      
      import("@/types/annotation").then(({ convertRawToInternalFormat }) => {
        const convertedData = convertRawToInternalFormat(rawData);
        onDatasetChange(convertedData);
        toast.success("Dataset updated successfully!");
      });
    } catch (error) {
      console.error("Invalid JSON:", error);
      toast.error("Invalid JSON format");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>JSON Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={jsonContent}
          onChange={handleJsonChange}
          className="font-mono text-sm h-[500px]"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleUpdateDataset}>
          Update Dataset
        </Button>
        <Button onClick={handleSaveToFile}>
          Save to File
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JsonEditor;
