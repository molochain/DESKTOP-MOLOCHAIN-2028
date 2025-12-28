import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Shield, Smartphone, Key, AlertCircle, Check, Copy, RefreshCw, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { fetchWithCsrf } from "@/lib/csrf";

interface TwoFactorData {
  qrCode: string;
  recoveryCodes: string[];
}

interface TwoFactorAuthProps {
  mode?: "section" | "setup" | "verify";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TwoFactorAuth({ mode = "section", onSuccess, onCancel }: TwoFactorAuthProps) {
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupData, setSetupData] = useState<TwoFactorData | null>(null);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [step, setStep] = useState<"qrcode" | "verification" | "recovery">("qrcode");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check 2FA status (only for section mode)
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: mode === "section",
  });

  const twoFactorEnabled = user?.twoFactorEnabled || false;

  // Generate 2FA setup mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      // Use fetchWithCsrf for consistency
      const res = await fetchWithCsrf("/api/auth/2fa/generate", {
        method: "POST"
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate 2FA secret");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setSetupData(data.data || data);
      if (mode === "section") {
        setShowSetupDialog(true);
      } else {
        setStep("qrcode");
      }
      toast({
        title: "2FA Setup Ready",
        description: "Scan the QR code with your authenticator app",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Could not generate 2FA setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify and enable 2FA mutation
  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetchWithCsrf("/api/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to verify code");
      }
      return await res.json();
    },
    onSuccess: () => {
      if (mode === "section") {
        setShowRecoveryCodes(true);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      } else {
        setStep("recovery");
      }
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
      if (mode === "setup" && onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Login verification mutation (for verify mode)
  const loginVerifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetchWithCsrf("/api/auth/2fa/login", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to verify code");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification successful",
        description: "You have been successfully authenticated",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Recovery code verification mutation
  const recoveryMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetchWithCsrf("/api/auth/2fa/recovery", {
        method: "POST",
        body: JSON.stringify({ recoveryCode: code }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to verify recovery code");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recovery successful",
        description: "You have been successfully authenticated",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Recovery failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithCsrf("/api/auth/2fa/disable", {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to disable 2FA");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setShowDisableDialog(false);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Disable",
        description: error.message || "Could not disable 2FA. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSetup = () => {
    generateMutation.mutate();
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    if (mode === "verify") {
      loginVerifyMutation.mutate(verificationCode);
    } else {
      verifyMutation.mutate(verificationCode);
    }
  };

  const handleRecoverySubmit = () => {
    if (!recoveryCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a recovery code",
        variant: "destructive",
      });
      return;
    }
    recoveryMutation.mutate(recoveryCode);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied",
      description: "Recovery code copied to clipboard",
    });
  };

  const copyAllRecoveryCodes = () => {
    if (!setupData?.recoveryCodes) return;
    
    const allCodes = setupData.recoveryCodes.join("\n");
    navigator.clipboard.writeText(allCodes).then(() => {
      toast({
        title: "All recovery codes copied",
        description: "Keep these in a safe place",
      });
    });
  };

  const downloadRecoveryCodes = () => {
    if (!setupData?.recoveryCodes) return;
    
    const content = "MoloChain 2FA Recovery Codes\n\n" +
      "Keep these codes in a safe place. Each code can only be used once.\n\n" +
      setupData.recoveryCodes.join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "molochain-2fa-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isPending = generateMutation.isPending || verifyMutation.isPending || 
                   loginVerifyMutation.isPending || recoveryMutation.isPending || 
                   disableMutation.isPending;

  // Render section mode (for profile page)
  if (mode === "section") {
    return (
      <>
        <div className="flex items-center justify-between p-4 border rounded-md" data-testid="2fa-section">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? "Your account is protected with 2FA" 
                  : "Add an extra layer of security to your account"}
              </p>
            </div>
          </div>
          <Button 
            variant={twoFactorEnabled ? "destructive" : "default"}
            size="sm"
            onClick={twoFactorEnabled ? () => setShowDisableDialog(true) : handleSetup}
            disabled={isPending}
            data-testid={twoFactorEnabled ? "button-disable-2fa" : "button-enable-2fa"}
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"
            )}
          </Button>
        </div>

        {/* Setup Dialog */}
        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app, then enter the verification code
              </DialogDescription>
            </DialogHeader>
            
            {!showRecoveryCodes ? (
              <div className="space-y-4">
                {setupData?.qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img 
                      src={setupData.qrCode} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                      data-testid="img-2fa-qr"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    data-testid="input-2fa-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending || verificationCode.length !== 6}
                    data-testid="button-verify-2fa"
                  >
                    {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">2FA Successfully Enabled!</span>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recovery Codes</CardTitle>
                    <CardDescription>
                      Save these codes in a safe place. You can use them to access your account if you lose your device.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData?.recoveryCodes.map((code, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm font-mono"
                          data-testid={`recovery-code-${index}`}
                        >
                          <span>{code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedCode === code ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={copyAllRecoveryCodes}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={downloadRecoveryCodes}
                        data-testid="button-download-codes"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <Button onClick={() => {
                    setShowSetupDialog(false);
                    setShowRecoveryCodes(false);
                    setVerificationCode("");
                    setSetupData(null);
                  }}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Disable Confirmation Dialog */}
        <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2">
                  <p>This will remove the extra security layer from your account.</p>
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Your account will be less secure without 2FA. We recommend keeping it enabled.
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep 2FA Enabled</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => disableMutation.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-disable"
              >
                {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Render setup mode (standalone setup component)
  if (mode === "setup") {
    // Initialize generation on mount if needed
    if (!setupData && !generateMutation.isPending && step === "qrcode") {
      generateMutation.mutate();
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generateMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Generating secure keys...</p>
            </div>
          )}

          {generateMutation.isError && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {generateMutation.error?.message || "Failed to generate 2FA secret"}
              </AlertDescription>
            </Alert>
          )}

          {step === "qrcode" && setupData?.qrCode && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator)
                </p>
                <img 
                  src={setupData.qrCode} 
                  alt="QR Code for two-factor authentication" 
                  className="w-48 h-48 mb-4"
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setStep("verification")}
                >
                  I've scanned the QR code
                </Button>
              </div>
            </div>
          )}

          {step === "verification" && (
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code from your authenticator app to verify setup
                </p>
                <div className="space-y-2">
                  <Label htmlFor="token">Verification code</Label>
                  <Input
                    id="token"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep("qrcode")}
                    type="button"
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending || verificationCode.length !== 6}
                  >
                    {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify
                  </Button>
                </div>
              </div>
            </form>
          )}

          {step === "recovery" && setupData?.recoveryCodes && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Save these recovery codes in a secure place. If you lose your authenticator device, you can use one of these codes to regain access to your account.
              </p>
              <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {setupData.recoveryCodes.map((code, index) => (
                    <div key={code} className="flex justify-between items-center">
                      <code className="bg-background px-2 py-1 rounded text-sm">{code}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(code)}
                        title="Copy code"
                      >
                        {copiedCode === code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={copyAllRecoveryCodes}
              >
                Copy all codes
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          {step === "qrcode" && (
            <Button 
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setStep("recovery")}
            >
              View recovery codes
            </Button>
          )}
          {step === "recovery" && (
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={() => setStep("verification")}
            >
              Continue to verification
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Render verify mode (for login verification)
  if (mode === "verify") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            {showRecoveryInput 
              ? "Enter a recovery code to access your account" 
              : "Enter the verification code from your authenticator app"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if (showRecoveryInput) {
            handleRecoverySubmit();
          } else {
            handleVerify();
          }
        }}>
          <CardContent>
            {!showRecoveryInput ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Verification code</Label>
                  <Input
                    id="token"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recoveryCode">Recovery code</Label>
                <Input
                  id="recoveryCode"
                  placeholder="Enter recovery code"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onCancel}
                type="button"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPending || (!showRecoveryInput && verificationCode.length !== 6)}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-xs"
              onClick={() => {
                setShowRecoveryInput(!showRecoveryInput);
                setVerificationCode("");
                setRecoveryCode("");
              }}
              disabled={isPending}
            >
              {showRecoveryInput ? "Use authenticator app instead" : "Use recovery code instead"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return null;
}

// Export convenience components for backward compatibility
export function TwoFactorSection() {
  return <TwoFactorAuth mode="section" />;
}

export function SetupTwoFactor({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  return <TwoFactorAuth mode="setup" onSuccess={onSuccess} onCancel={onCancel} />;
}

export function VerifyTwoFactor({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  return <TwoFactorAuth mode="verify" onSuccess={onSuccess} onCancel={onCancel} />;
}