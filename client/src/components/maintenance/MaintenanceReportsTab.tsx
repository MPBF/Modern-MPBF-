import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { generateMaintenanceReportNumber } from "../../../../shared/id-generator";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { canAddInArea } from "../../utils/roleUtils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

import AdvancedSection from "./AdvancedSection";
import { createMaintenanceReportSchema } from "./maintenanceSchemas";

export default function MaintenanceReportsTab() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canAddMaint = canAddInArea(user, "maintenance");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/maintenance-reports"],
  });

  const createReportMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/maintenance-reports", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-reports"] });
      toast({ title: t("maintenance.toast.reportCreated") });
    },
    onError: () => {
      toast({
        title: t("maintenance.toast.reportCreateFailed"),
        variant: "destructive",
      });
    },
  });

  const maintenanceReportSchema = createMaintenanceReportSchema(t);

  const form = useForm({
    resolver: zodResolver(maintenanceReportSchema),
    defaultValues: {
      report_type: "",
      title: "",
      description: "",
      machine_id: "",
      severity: "medium",
      priority: "medium",
      spare_parts_needed: [],
      estimated_repair_time: 0,
    },
  });

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      toast({
        title: t("maintenance.error"),
        description: t("maintenance.loginRequiredForReport"),
        variant: "destructive",
      });
      return;
    }

    try {
      const reportNumber = generateMaintenanceReportNumber();

      await createReportMutation.mutate({
        ...data,
        report_number: reportNumber,
        reported_by_user_id: user.id,
        status: "open",
        estimated_repair_time: data.estimated_repair_time || null,
      });

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating maintenance report:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("maintenance.tabs.reports")}</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {canAddMaint && (
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {t("maintenance.addNewReport")}
              </Button>
            </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {t("maintenance.addReportDialogTitle")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("maintenance.addReportDialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="report_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("maintenance.reportType")}</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("maintenance.selectReportType")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breakdown">
                              {t("maintenance.reportTypes.breakdown")}
                            </SelectItem>
                            <SelectItem value="malfunction">
                              {t("maintenance.reportTypes.malfunction")}
                            </SelectItem>
                            <SelectItem value="safety">
                              {t("maintenance.reportTypes.safety")}
                            </SelectItem>
                            <SelectItem value="quality">
                              {t("maintenance.reportTypes.quality")}
                            </SelectItem>
                            <SelectItem value="preventive">
                              {t("maintenance.reportTypes.preventive")}
                            </SelectItem>
                            <SelectItem value="spare_parts">
                              {t("maintenance.reportTypes.spareParts")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("maintenance.reportTitle")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              "maintenance.reportTitlePlaceholder",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.issueDescription")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t(
                              "maintenance.issueDescriptionPlaceholder",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AdvancedSection>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("maintenance.severity")}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t(
                                      "maintenance.selectSeverity",
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">
                                  {t("maintenance.severity.low")}
                                </SelectItem>
                                <SelectItem value="medium">
                                  {t("maintenance.severity.medium")}
                                </SelectItem>
                                <SelectItem value="high">
                                  {t("maintenance.severity.high")}
                                </SelectItem>
                                <SelectItem value="critical">
                                  {t("maintenance.severity.critical")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="machine_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.machineOptional")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t(
                                  "maintenance.machineIdPlaceholder",
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimated_repair_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.estimatedRepairTime")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AdvancedSection>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit">
                      {t("maintenance.submitReport")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          </div>
        ) : Array.isArray(reports) && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report: any) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    {report.report_number} - {report.title}
                  </h3>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        report.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {report.severity}
                    </Badge>
                    <Badge>{report.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {report.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">
                      {t("maintenance.reportType")}:{" "}
                    </span>
                    {report.report_type}
                  </div>
                  <div>
                    <span className="font-medium">
                      {t("maintenance.reportDate")}:{" "}
                    </span>
                    {new Date(report.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("maintenance.noReports")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
