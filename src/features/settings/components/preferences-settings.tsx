"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { useSettings } from "../hooks/use-settings";

export const PreferencesSettings = () => {
  const {
    settings,
    isLoading,
    updateSettings,
    isUpdating,
  } = useSettings();

  const handleUpdate = (key: string, value: string | boolean) => {
    updateSettings(
      { [key]: value },
      {
        onSuccess: () => {
          toast.success("Preferences saved");
        },
        onError: (error) => {
          toast.error(`Failed to save: ${error.message}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Editor Preferences</CardTitle>
          <CardDescription>
            Customize your workflow editor experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
            <Select
              value={settings?.theme || "system"}
              onValueChange={(value) => handleUpdate("theme", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Line Numbers */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Line Numbers</Label>
              <p className="text-sm text-muted-foreground">
                Display line numbers in the code editor
              </p>
            </div>
            <Switch
              checked={settings?.showLineNumbers || false}
              onCheckedChange={(checked) => handleUpdate("showLineNumbers", checked)}
            />
          </div>

          {/* Snap to Grid */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Snap to Grid</Label>
              <p className="text-sm text-muted-foreground">
                Automatically align nodes to grid when moving
              </p>
            </div>
            <Switch
              checked={settings?.snapToGrid || false}
              onCheckedChange={(checked) => handleUpdate("snapToGrid", checked)}
            />
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use a more compact layout for the editor
              </p>
            </div>
            <Switch
              checked={settings?.compactMode || false}
              onCheckedChange={(checked) => handleUpdate("compactMode", checked)}
            />
          </div>

          {/* Show Mini Map */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Mini Map</Label>
              <p className="text-sm text-muted-foreground">
                Display a mini map of the workflow in the corner
              </p>
            </div>
            <Switch
              checked={settings?.showMiniMap || false}
              onCheckedChange={(checked) => handleUpdate("showMiniMap", checked)}
            />
          </div>
        </CardContent>
      </Card>

      
          </div>
  );
};