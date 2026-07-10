import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { generateOperatorReportNumber } from "../../../../shared/id-generator";
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
import { createOperatorNegligenceSchema } from "./maintenanceSchemas";

export default function OperatorNegligenceTab() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canAddMaint = canAddInArea(user, "maintenance");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/operator-negligence-reports"],
  });

  const createOperatorReportMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/operator-negligence-reports", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/operator-negligence-reports"],
      });
      toast({ title: t("maintenance.toast.negligenceCreated") });
    },
    onError: () => {
      toast({
        title: t("maintenance.toast.negligenceCreateFailed"),
        variant: "destructive",
      });
    },
  });

  const operatorNegligenceSchema = createOperatorNegligenceSchema(t);

  const form = useForm({
    resolver: zodResolver(operatorNegligenceSchema),
    defaultValues: {
      operator_id: "",
      operator_name: "",
      incident_date: "",
      incident_type: "",
      description: "",
      severity: "medium",
      witnesses: [],
      immediate_actions_taken: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      toast({
        title: t("maintenance.error"),
        description: t("maintenance.loginRequiredForNegligence"),
        variant: "destructive",
      });
      return;
    }

    try {
      const reportNumber = generateOperatorReportNumber();

      await createOperatorReportMutation.mutate({
        ...data,
        report_number: reportNumber,
        reported_by_user_id: user.id,
        report_date: new Date().toISOString().split("T")[0],
        status: "pending",
        follow_up_required:
          data.severity === "high" || data.severity === "critical",
      });

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating operator negligence report:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("maintenance.tabs.negligence")}</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {canAddMaint && (
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {t("maintenance.addNegligenceReport")}
              </Button>
            </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {t("maintenance.addNegligenceDialogTitle")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("maintenance.addNegligenceDialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="operator_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("maintenance.operatorId")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                "maintenance.operatorIdPlaceholder",
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operator_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("maintenance.operatorName")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                "maintenance.operatorNamePlaceholder",
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="incident_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("maintenance.incidentDate")}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="incident_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.negligenceType")}
                          </FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "maintenance.selectNegligenceType",
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="safety_violation">
                                {t(
                                  "maintenance.negligenceTypes.safetyViolation",
                                )}
                              </SelectItem>
                              <SelectItem value="equipment_misuse">
                                {t(
                                  "maintenance.negligenceTypes.equipmentMisuse",
                                )}
                              </SelectItem>
                              <SelectItem value="procedure_violation">
                                {t(
                                  "maintenance.negligenceTypes.procedureViolation",
                                )}
                              </SelectItem>
                              <SelectItem value="quality_negligence">
                                {t(
                                  "maintenance.negligenceTypes.qualityNegligence",
                                )}
                              </SelectItem>
                              <SelectItem value="time_violation">
                                {t("maintenance.negligenceTypes.timeViolation")}
                              </SelectItem>
                              <SelectItem value="maintenance_neglect">
                                {t(
                                  "maintenance.negligenceTypes.maintenanceNeglect",
                                )}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.incidentDescription")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t(
                              "maintenance.incidentDescriptionPlaceholder",
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
                            <FormLabel>
                              {t("maintenance.negligenceSeverity")}
                            </FormLabel>
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
                        name="immediate_actions_taken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.immediateActions")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={t(
                                  "maintenance.immediateActionsPlaceholder",
                                )}
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
                    {report.report_number} - {report.operator_name}
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
                      {t("maintenance.negligenceType")}:{" "}
                    </span>
                    {report.incident_type}
                  </div>
                  <div>
                    <span className="font-medium">
                      {t("maintenance.incidentDate")}:{" "}
                    </span>
                    {new Date(report.incident_date).toLocaleDateString("en-US")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("maintenance.noNegligenceReports")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
