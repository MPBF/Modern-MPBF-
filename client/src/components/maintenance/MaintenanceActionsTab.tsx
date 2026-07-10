import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Edit, Eye, Plus, Printer, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { generateActionNumber } from "../../../../shared/id-generator";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import {
  canAddInArea,
  canEditInArea,
  canDeleteInArea,
} from "../../utils/roleUtils";
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
import { createMaintenanceActionSchema } from "./maintenanceSchemas";

export default function MaintenanceActionsTab() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isActionViewDialogOpen, setIsActionViewDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: spareParts } = useQuery({ queryKey: ["/api/spare-parts"] });
  const { data: actions, isLoading } = useQuery({
    queryKey: ["/api/maintenance-actions"],
  });
  const { data: requests } = useQuery({
    queryKey: ["/api/maintenance-requests"],
  });
  const { data: users } = useQuery({ queryKey: ["/api/users"] });
  const { user } = useAuth();
  const canAddMaint = canAddInArea(user, "maintenance");
  const canEditMaint = canEditInArea(user, "maintenance");
  const canDeleteMaint = canDeleteInArea(user, "maintenance");

  const createActionMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("Sending maintenance action data:", data);
      return apiRequest("/api/maintenance-actions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      console.log("Maintenance action created successfully:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-actions"] });
      toast({ title: t("maintenance.toast.actionCreated") });
    },
    onError: (error) => {
      console.error("Failed to create maintenance action:", error);
      toast({
        title: t("maintenance.toast.actionCreateFailed"),
        variant: "destructive",
      });
    },
  });

  const maintenanceActionSchema = createMaintenanceActionSchema(t);

  const form = useForm({
    resolver: zodResolver(maintenanceActionSchema),
    defaultValues: {
      maintenance_request_id: 0,
      action_type: "",
      description: "",
      text_report: "",
      spare_parts_request: "",
      machining_request: "",
      operator_negligence_report: "",
      performed_by: "",
      requires_management_action: false,
      management_notified: false,
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue("performed_by", user.id.toString());
    }
  }, [user?.id, form]);

  const onSubmit = async (data: any) => {
    try {
      console.log("Form data submitted:", data);

      const actionNumber = generateActionNumber();

      const submitData = {
        ...data,
        action_number: actionNumber,
        request_created_by: user?.id?.toString() || "",
      };

      console.log("Submitting action data:", submitData);
      await createActionMutation.mutate(submitData);

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating maintenance action:", error);
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("maintenance.tabs.actions")}</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {canAddMaint && (
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {t("maintenance.addNewAction")}
              </Button>
            </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {t("maintenance.addActionDialogTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("maintenance.addActionDialogDescription")}
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
                      name="maintenance_request_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.maintenanceRequest")}
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "maintenance.selectMaintenanceRequest",
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(requests) &&
                                requests.map((request: any) => (
                                  <SelectItem
                                    key={request.id}
                                    value={request.id.toString()}
                                  >
                                    {request.request_number} -{" "}
                                    {request.description}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="action_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("maintenance.actionType")}</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "maintenance.selectActionType",
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="فحص مبدئي">
                                {t("maintenance.actionTypes.initialInspection")}
                              </SelectItem>
                              <SelectItem value="تغيير قطعة غيار">
                                {t("maintenance.actionTypes.sparePartChange")}
                              </SelectItem>
                              <SelectItem value="إصلاح مكانيكي">
                                {t("maintenance.actionTypes.mechanicalRepair")}
                              </SelectItem>
                              <SelectItem value="إصلاح كهربائي">
                                {t("maintenance.actionTypes.electricalRepair")}
                              </SelectItem>
                              <SelectItem value="إيقاف الماكينة">
                                {t("maintenance.actionTypes.machineShutdown")}
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
                    name="performed_by"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("maintenance.performer")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={user?.id ? user.id.toString() : ""}
                            type="hidden"
                            className="hidden"
                          />
                        </FormControl>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded border">
                          <div className="font-medium text-sm">
                            {user
                              ? `${user.display_name || user.username} (${user.id})`
                              : t("common.loading")}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t("maintenance.actionRegisteredAsCurrentUser")}
                          </div>
                        </div>
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
                          {t("maintenance.actionDescription")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t(
                              "maintenance.actionDescriptionPlaceholder",
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
                      name="text_report"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("maintenance.textReport")}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t(
                                "maintenance.textReportPlaceholder",
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="spare_parts_request"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.sparePartsRequest")}
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("maintenance.selectSparePart")}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.isArray(spareParts) &&
                                spareParts.length > 0 ? (
                                  spareParts
                                    .filter(
                                      (part) =>
                                        part.part_id &&
                                        part.part_name &&
                                        part.code,
                                    )
                                    .map((part: any) => (
                                      <SelectItem
                                        key={part.part_id}
                                        value={`${part.part_name}_${part.code}_${part.part_id}`}
                                      >
                                        {part.part_name} ({part.code}) -{" "}
                                        {part.machine_name}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <SelectItem value="no_parts">
                                    {t("maintenance.noSparePartsAvailable")}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="machining_request"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.machiningRequest")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t(
                                "maintenance.machiningRequestPlaceholder",
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operator_negligence_report"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.operatorNegligenceReport")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t(
                                "maintenance.operatorNegligencePlaceholder",
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
                      name="requires_management_action"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("maintenance.needsManagementApproval")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="management_notified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("maintenance.managementNotifiedLabel")}
                            </FormLabel>
                          </div>
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
                    <Button type="submit">{t("maintenance.saveAction")}</Button>
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
        ) : Array.isArray(actions) && actions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.actionNumber")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.maintenanceRequestNumber")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.actionType")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.description")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.performer")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.sparePartsRequest")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.machiningRequest")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.managementApproval")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("maintenance.executionDate")}
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action: any) => {
                  const performedByUser = Array.isArray(users)
                    ? users.find(
                        (u: any) => u.id.toString() === action.performed_by,
                      )
                    : null;
                  const maintenanceRequest = Array.isArray(requests)
                    ? requests.find(
                        (r: any) => r.id === action.maintenance_request_id,
                      )
                    : null;

                  const handleView = () => {
                    setSelectedAction(action);
                    setIsActionViewDialogOpen(true);
                  };

                  const handlePrint = () => {
                    const printContent = `
                      <div style="font-family: Arial; direction: rtl; text-align: right; padding: 20px;">
                        <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">
                          ${t("maintenance.printActionTitle")}: ${action.action_number}
                        </h2>
                        <div style="margin: 20px 0;">
                          <p><strong>${t("maintenance.maintenanceRequestNumber")}:</strong> ${maintenanceRequest?.request_number || action.maintenance_request_id}</p>
                          <p><strong>${t("maintenance.actionType")}:</strong> ${action.action_type}</p>
                          <p><strong>${t("maintenance.description")}:</strong> ${action.description || "-"}</p>
                          <p><strong>${t("maintenance.performer")}:</strong> ${performedByUser ? performedByUser.full_name || performedByUser.username : action.performed_by}</p>
                          <p><strong>${t("maintenance.sparePartsRequest")}:</strong> ${action.spare_parts_request || "-"}</p>
                          <p><strong>${t("maintenance.machiningRequest")}:</strong> ${action.machining_request || "-"}</p>
                          <p><strong>${t("maintenance.operatorNegligenceReport")}:</strong> ${action.operator_negligence_report || "-"}</p>
                          <p><strong>${t("maintenance.textReport")}:</strong> ${action.text_report || "-"}</p>
                          <p><strong>${t("maintenance.managementApprovalRequired")}:</strong> ${action.requires_management_action ? t("maintenance.yes") : t("maintenance.no")}</p>
                          <p><strong>${t("maintenance.executionDate")}:</strong> ${new Date(action.action_date).toLocaleDateString("en-US")}</p>
                          <p><strong>${t("maintenance.executionTime")}:</strong> ${new Date(action.action_date).toLocaleTimeString("en-US")}</p>
                        </div>
                      </div>
                    `;

                    const printWindow = window.open("", "_blank");
                    printWindow?.document.write(printContent);
                    printWindow?.document.close();
                    printWindow?.print();
                  };

                  const handleDelete = async () => {
                    if (
                      confirm(
                        t("maintenance.confirmDeleteAction", {
                          number: action.action_number,
                        }),
                      )
                    ) {
                      try {
                        const response = await fetch(
                          `/api/maintenance-actions/${action.id}`,
                          {
                            method: "DELETE",
                          },
                        );

                        if (!response.ok) {
                          const errorData = await response
                            .json()
                            .catch(() => null);
                          const errorMessage =
                            errorData?.message ||
                            t("maintenance.deleteActionError");
                          alert(errorMessage);
                          return;
                        }

                        window.location.reload();
                      } catch (error) {
                        console.error(
                          "Error deleting maintenance action:",
                          error,
                        );
                        alert(t("maintenance.connectionError"));
                      }
                    }
                  };

                  const handleEdit = () => {
                    alert(
                      t("maintenance.editActionComingSoon", {
                        number: action.action_number,
                      }),
                    );
                  };

                  return (
                    <tr key={action.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center font-medium text-blue-600">
                        {action.action_number}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-medium text-green-600">
                        {maintenanceRequest?.request_number ||
                          `MO${action.maintenance_request_id.toString().padStart(3, "0")}`}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {action.action_type}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {action.description || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {performedByUser
                          ? performedByUser.full_name ||
                            performedByUser.username
                          : action.performed_by}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {action.spare_parts_request || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {action.machining_request || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {action.requires_management_action ? (
                          <Badge variant="destructive">
                            {t("maintenance.required")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {t("maintenance.notRequired")}
                          </Badge>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {new Date(action.action_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          },
                        )}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(action.action_date).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 h-8 w-8 p-0"
                            onClick={handleView}
                            title={t("maintenance.view")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200 h-8 w-8 p-0"
                            onClick={handlePrint}
                            title={t("maintenance.print")}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {canEditMaint && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200 h-8 w-8 p-0"
                            onClick={handleEdit}
                            title={t("maintenance.edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          )}
                          {canDeleteMaint && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 h-8 w-8 p-0"
                            onClick={handleDelete}
                            title={t("maintenance.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("maintenance.noActions")}</p>
          </div>
        )}
      </CardContent>
    </Card>
      <Dialog
        open={isActionViewDialogOpen}
        onOpenChange={setIsActionViewDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("maintenance.actionDetails")}</DialogTitle>
            <DialogDescription>
              {t("maintenance.actionDetailsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedAction &&
            (() => {
              const performedByUser = Array.isArray(users)
                ? users.find(
                    (u: any) => u.id.toString() === selectedAction.performed_by,
                  )
                : null;
              const maintenanceRequest = Array.isArray(requests)
                ? requests.find(
                    (r: any) => r.id === selectedAction.maintenance_request_id,
                  )
                : null;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.actionNumber")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">
                        {selectedAction.action_number}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.maintenanceRequestNumber")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">
                        {maintenanceRequest?.request_number ||
                          selectedAction.maintenance_request_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.actionType")}
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-sm">
                          {selectedAction.action_type}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.performer")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                        {performedByUser
                          ? performedByUser.display_name_ar ||
                            performedByUser.display_name ||
                            performedByUser.username
                          : selectedAction.performed_by}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t("maintenance.actionDescription")}
                    </label>
                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded min-h-[60px]">
                      {selectedAction.description ||
                        t("maintenance.noDescription")}
                    </p>
                  </div>

                  {selectedAction.text_report && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.textReport")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 bg-blue-50 p-3 rounded min-h-[60px] border border-blue-200">
                        {selectedAction.text_report}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.sparePartsRequest")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                        {selectedAction.spare_parts_request ||
                          t("maintenance.none")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.machiningRequest")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                        {selectedAction.machining_request ||
                          t("maintenance.none")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.requiresManagementAction")}
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedAction.requires_management_action
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {selectedAction.requires_management_action
                            ? t("maintenance.yes")
                            : t("maintenance.no")}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.managementNotified")}
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedAction.management_notified
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedAction.management_notified
                            ? t("maintenance.yes")
                            : t("maintenance.no")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.executionDate")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                        {selectedAction.performed_at
                          ? new Date(
                              selectedAction.performed_at,
                            ).toLocaleDateString("en-US")
                          : t("maintenance.notAssigned")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.creationDate")}
                      </label>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                        {selectedAction.created_at
                          ? new Date(
                              selectedAction.created_at,
                            ).toLocaleDateString("en-US")
                          : t("maintenance.notAssigned")}
                      </p>
                    </div>
                  </div>

                  {maintenanceRequest && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t("maintenance.machineInfo")}
                      </label>
                      <div className="mt-1 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm">
                          <strong>{t("maintenance.machineId")}:</strong>{" "}
                          {maintenanceRequest.machine_id}
                        </p>
                        <p className="text-sm">
                          <strong>{t("maintenance.issueTypeLabel")}:</strong>{" "}
                          {maintenanceRequest.issue_type}
                        </p>
                        <p className="text-sm">
                          <strong>{t("maintenance.priorityLevel")}:</strong>{" "}
                          {maintenanceRequest.urgency_level}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
