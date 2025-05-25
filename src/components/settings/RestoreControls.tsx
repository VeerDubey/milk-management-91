
import { Button } from "@/components/ui/button";
import { UploadCloud, RefreshCw } from "lucide-react";

interface RestoreControlsProps {
  onImport: (event?: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
}

export const RestoreControls = ({ onImport, isImporting }: RestoreControlsProps) => {
  const isElectron = Boolean(window.electron?.isElectron);

  return (
    <div>
      <h3 className="font-medium mb-2">Restore Data</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Import previously exported data. This will replace all current data.
      </p>
      <div className="flex items-center">
        {isElectron ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onImport()}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 mr-2" />
                Import Data
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
            <input
              type="file"
              id="file-upload"
              accept=".json"
              className="hidden"
              onChange={onImport}
              disabled={isImporting}
            />
          </>
        )}
      </div>
    </div>
  );
};
