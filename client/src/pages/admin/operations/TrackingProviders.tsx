import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const providerSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["FEDEX", "UPS", "DHL", "USPS", "MAERSK"]),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  accountNumber: z.string().optional(),
  meterNumber: z.string().optional(),
  isEnabled: z.boolean().default(true),
});

type ProviderInput = z.infer<typeof providerSchema>;

interface Provider extends ProviderInput {
  id: number;
}

export default function TrackingProviders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const form = useForm<ProviderInput>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      isEnabled: true,
    },
  });

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["/api/admin/tracking-providers"],
  });

  const addProvider = useMutation({
    mutationFn: async (data: ProviderInput) => {
      const res = await fetch("/api/admin/tracking-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('admin.operations.tracking.toast.providerAdded'),
        description: t('admin.operations.tracking.toast.providerAddedDesc'),
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('admin.operations.tracking.toast.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleProvider = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const res = await fetch(`/api/admin/tracking-providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enabled }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onError: (error) => {
      toast({
        title: t('admin.operations.tracking.toast.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProviderInput) => {
    addProvider.mutate(data);
  };

  return (
    <div className="container py-10">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.operations.tracking.cards.addProvider')}</CardTitle>
            <CardDescription>
              {t('admin.operations.tracking.cards.addProviderDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.tracking.form.providerName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.operations.tracking.form.providerNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.tracking.form.providerType')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.operations.tracking.form.providerTypePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FEDEX">{t('admin.operations.tracking.providerTypes.FEDEX')}</SelectItem>
                          <SelectItem value="UPS">{t('admin.operations.tracking.providerTypes.UPS')}</SelectItem>
                          <SelectItem value="DHL">{t('admin.operations.tracking.providerTypes.DHL')}</SelectItem>
                          <SelectItem value="USPS">{t('admin.operations.tracking.providerTypes.USPS')}</SelectItem>
                          <SelectItem value="MAERSK">{t('admin.operations.tracking.providerTypes.MAERSK')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.tracking.form.apiKey')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.operations.tracking.form.apiKeyPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.tracking.form.apiSecret')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.operations.tracking.form.apiSecretPlaceholder')} {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.tracking.form.accountNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.operations.tracking.form.accountNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meterNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.operations.tracking.form.meterNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.operations.tracking.form.meterNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">{t('admin.operations.tracking.form.enabled')}</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {t('admin.operations.tracking.buttons.addProvider')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.operations.tracking.cards.configuredProviders')}</CardTitle>
            <CardDescription>
              {t('admin.operations.tracking.cards.configuredProvidersDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>{t('admin.operations.tracking.labels.loading')}</div>
            ) : providers.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {t('admin.operations.tracking.labels.noProviders')}
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('admin.operations.tracking.table.type')}: {provider.type}
                      </p>
                    </div>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={(enabled) =>
                        toggleProvider.mutate({ id: provider.id, enabled })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
