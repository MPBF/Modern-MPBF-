import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "../ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

import AdvancedSection from "./AdvancedSection";
import { createMaintenanceRequestSchema } from "./maintenanceSchemas";

export default function MaintenanceRequestDialog({
  machines,
  users,
  onSubmit,
  isLoading,
  initialValues,
}: any) {
  const { t } = useTranslation();
  const maintenanceRequestSchema = createMaintenanceRequestSchema(t);
  const isEdit = !!initialValues;

  const form = useForm({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      machine_id: initialValues?.machine_id ?? "",
      issue_type: initialValues?.issue_type ?? "mechanical",
      urgency_level: initialValues?.urgency_level ?? "normal",
      description: initialValues?.description ?? "",
      assigned_to:
        initialValues?.assigned_to != null
          ? String(initialValues.assigned_to)
          : "none",
    },
  });

  const handleSubmit = (data: any) => {
    const submitData = {
      ...data,
      assigned_to: data.assigned_to === "none" ? "" : data.assigned_to,
    };
    onSubmit(submitData);
    if (!isEdit) form.reset();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {isEdit
            ? t("maintenance.editRequest")
            : t("maintenance.newRequest")}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600">
          {isEdit
            ? t("maintenance.editRequestDescription")
            : t("maintenance.newRequestDescription")}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="machine_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maintenance.equipment")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("maintenance.selectEquipment")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(machines) &&
                        machines
                          .filter(
                            (machine) =>
                              machine.id &&
                              machine.id !== "" &&
                              machine.id !== null &&
                              machine.id !== undefined,
                          )
                          .map((machine: any) => (
                            <SelectItem
                              key={machine.id}
                              value={machine.id.toString()}
                            >
                              {machine.name_ar}
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
              name="issue_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maintenance.issueTypeLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("maintenance.selectIssueType")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mechanical">
                        {t("maintenance.issueType.mechanical")}
                      </SelectItem>
                      <SelectItem value="electrical">
                        {t("maintenance.issueType.electrical")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("maintenance.issueType.other")}
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
                <FormLabel>{t("maintenance.issueDescription")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      "maintenance.issueDescriptionDetailPlaceholder",
                    )}
                    className="min-h-[100px]"
                    {...field}
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
                name="urgency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("maintenance.urgencyLevel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("maintenance.selectUrgencyLevel")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">
                          {t("maintenance.urgency.normal")}
                        </SelectItem>
                        <SelectItem value="medium">
                          {t("maintenance.urgency.medium")}
                        </SelectItem>
                        <SelectItem value="urgent">
                          {t("maintenance.urgency.urgent")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("maintenance.assignedToOptional")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("maintenance.selectTechnician")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("maintenance.noAssignment")}
                        </SelectItem>
                        {Array.isArray(users) &&
                          users
                            .filter((user: any) => user.role === "technician")
                            .map((user: any) => (
                              <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                              >
                                {user.full_name || user.username}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AdvancedSection>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading
                ? isEdit
                  ? t("common.saving")
                  : t("maintenance.creating")
                : isEdit
                  ? t("common.save")
                  : t("maintenance.createRequest")}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
