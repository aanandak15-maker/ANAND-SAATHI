import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Eye, 
  Type, 
  Contrast, 
  Hand,
  Check,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface AccessibilitySettings {
  fontSize: number;
  contrast: "normal" | "high";
  largeButtons: boolean;
  simplifiedUI: boolean;
}

const SimplifiedAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: "normal",
    largeButtons: true,
    simplifiedUI: true
  });

  const [isApplied, setIsApplied] = useState(false);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsApplied(false);
  };

  const applySettings = () => {
    // Apply accessibility settings to the document
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Contrast
    if (settings.contrast === "high") {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Large buttons
    if (settings.largeButtons) {
      root.classList.add("large-buttons");
    } else {
      root.classList.remove("large-buttons");
    }
    
    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add("simplified-ui");
    } else {
      root.classList.remove("simplified-ui");
    }
    
    setIsApplied(true);
    toast.success("Accessibility settings applied successfully!");
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 16,
      contrast: "normal",
      largeButtons: true,
      simplifiedUI: true
    });
    
    // Reset document styles
    const root = document.documentElement;
    root.style.fontSize = "16px";
    root.classList.remove("high-contrast", "large-buttons", "simplified-ui");
    
    setIsApplied(false);
    toast.success("Settings reset to default");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Large Text</span>
            </div>
            <Switch
              checked={settings.fontSize > 16}
              onCheckedChange={(checked) => updateSetting("fontSize", checked ? 18 : 16)}
            />
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              <span>High Contrast</span>
            </div>
            <Switch
              checked={settings.contrast === "high"}
              onCheckedChange={(checked) => updateSetting("contrast", checked ? "high" : "normal")}
            />
          </div>

          {/* Large Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4" />
              <span>Large Buttons</span>
            </div>
            <Switch
              checked={settings.largeButtons}
              onCheckedChange={(checked) => updateSetting("largeButtons", checked)}
            />
          </div>

          {/* Simplified UI */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Simplified Interface</span>
            </div>
            <Switch
              checked={settings.simplifiedUI}
              onCheckedChange={(checked) => updateSetting("simplifiedUI", checked)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={applySettings} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Apply Settings
            </Button>
            <Button onClick={resetSettings} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {isApplied && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm">
                Accessibility settings have been applied to improve your experience!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access Features */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🔊</div>
              <h3 className="font-medium">Audio Guide</h3>
              <p className="text-sm text-muted-foreground">
                Multi-language audio for all features
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-medium">Mobile Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for smartphones
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-medium">Offline Ready</h3>
              <p className="text-sm text-muted-foreground">
                Works without internet
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium">Simple Interface</h3>
              <p className="text-sm text-muted-foreground">
                Easy to use for everyone
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedAccessibility;

