import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import {
  canAddInArea,
  canEditInArea,
  canDeleteInArea,
} from "../../utils/roleUtils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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

export default function SparePartsTab({
  spareParts,
  isLoading,
}: {
  spareParts: any[];
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canAddMaint = canAddInArea(user, "maintenance");
  const canEditMaint = canEditInArea(user, "maintenance");
  const canDeleteMaint = canDeleteInArea(user, "maintenance");
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSparePartMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/spare-parts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      toast({ title: t("maintenance.toast.sparePartCreated") });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: t("maintenance.toast.sparePartCreateFailed"),
        variant: "destructive",
      });
    },
  });

  const updateSparePartMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/spare-parts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      toast({ title: t("maintenance.toast.sparePartUpdated") });
      setIsEditDialogOpen(false);
      setSelectedPart(null);
    },
    onError: () => {
      toast({
        title: t("maintenance.toast.sparePartUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  const deleteSparePartMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/spare-parts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      toast({ title: t("maintenance.toast.sparePartDeleted") });
      setPartToDelete(null);
    },
    onError: () => {
      toast({
        title: t("maintenance.toast.sparePartDeleteFailed"),
        variant: "destructive",
      });
    },
  });

  const handleView = (part: any) => {
    setSelectedPart(part);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (part: any) => {
    setSelectedPart(part);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (part: any) => {
    setPartToDelete(part);
  };

  const confirmDelete = () => {
    if (partToDelete) {
      deleteSparePartMutation.mutate(partToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("maintenance.sparePartsManagement")}
        </h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          {canAddMaint && (
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 ml-2" />
              {t("maintenance.addNewSparePart")}
            </Button>
          </DialogTrigger>
          )}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("maintenance.addNewSparePart")}</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {t("maintenance.addSparePartDescription")}
              </DialogDescription>
            </DialogHeader>
            <SparePartForm
              onSubmit={createSparePartMutation.mutate}
              isLoading={createSparePartMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">{t("common.loading")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("maintenance.partNumber")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("maintenance.machineName")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("maintenance.partName")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("maintenance.code")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("maintenance.serialNumber")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("maintenance.specifications")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(spareParts) && spareParts.length > 0 ? (
                    spareParts.map((part: any) => (
                      <tr key={part.part_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                          {part.part_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {part.machine_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {part.part_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {part.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {part.serial_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate text-center">
                          {part.specifications}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleView(part)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEditMaint && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(part)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            )}
                            {canDeleteMaint && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => handleDelete(part)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {t("maintenance.noSpareParts")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("maintenance.sparePartDetails")}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t("maintenance.sparePartDetailsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("maintenance.partNumber")}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPart.part_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("maintenance.code")}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPart.code}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("maintenance.machineName")}
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedPart.machine_name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("maintenance.partName")}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPart.part_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("maintenance.serialNumber")}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPart.serial_number}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("maintenance.specifications")}
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedPart.specifications}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("maintenance.editSparePart")}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t("maintenance.editSparePartDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedPart && (
            <SparePartEditForm
              part={selectedPart}
              onSubmit={(data) =>
                updateSparePartMutation.mutate({ id: selectedPart.id, data })
              }
              isLoading={updateSparePartMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!partToDelete} onOpenChange={() => setPartToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("maintenance.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t("maintenance.confirmDeleteSparePartMessage")}
            </DialogDescription>
          </DialogHeader>
          {partToDelete && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                {t("maintenance.deleteSparePartWarning", {
                  id: partToDelete.part_id,
                  name: partToDelete.part_name,
                })}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPartToDelete(null)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteSparePartMutation.isPending}
                >
                  {deleteSparePartMutation.isPending
                    ? t("maintenance.deleting")
                    : t("maintenance.delete")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SparePartForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const { data: spareParts } = useQuery({ queryKey: ["/api/spare-parts"] });
  const { data: machines } = useQuery({ queryKey: ["/api/machines"] });

  const generateNextPartId = (currentSpareParts: any[]) => {
    if (!Array.isArray(currentSpareParts)) return "SP001";

    const partNumbers = currentSpareParts
      .map((part: any) => part.part_id)
      .filter((id: string) => id && id.match(/^SP\d+$/))
      .map((id: string) => parseInt(id.replace("SP", "")))
      .filter((num: number) => !isNaN(num));

    const nextNumber =
      partNumbers.length > 0 ? Math.max(...partNumbers) + 1 : 1;
    return `SP${nextNumber.toString().padStart(3, "0")}`;
  };

  const form = useForm({
    defaultValues: {
      part_id: "SP001",
      machine_name: "",
      part_name: "",
      code: "",
      serial_number: "",
      specifications: "",
    },
  });

  useEffect(() => {
    if (spareParts && Array.isArray(spareParts)) {
      const nextId = generateNextPartId(spareParts);
      if (nextId !== form.getValues("part_id")) {
        form.setValue("part_id", nextId);
      }
    }
  }, [spareParts, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="part_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.partNumberAuto")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="bg-gray-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.code")}</FormLabel>
                <FormControl>
                  <Input placeholder="A8908" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="machine_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maintenance.machineName")}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("maintenance.selectMachine")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(machines) && machines.length > 0 ? (
                      machines.map((machine: any) => {
                        const label =
                          machine.name_ar || machine.name || `#${machine.id}`;
                        return (
                          <SelectItem key={machine.id} value={label}>
                            {label} ({machine.id})
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no_machines">
                        {t("maintenance.noMachinesAvailable")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="part_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.partName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("maintenance.partNamePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.serialNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder="E5SH973798" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maintenance.specifications")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("maintenance.specificationsPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? t("maintenance.saving") : t("maintenance.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SparePartEditForm({
  part,
  onSubmit,
  isLoading,
}: {
  part: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const { data: machines } = useQuery({ queryKey: ["/api/machines"] });

  const form = useForm({
    defaultValues: {
      part_id: part.part_id || "",
      machine_name: part.machine_name || "",
      part_name: part.part_name || "",
      code: part.code || "",
      serial_number: part.serial_number || "",
      specifications: part.specifications || "",
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="part_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.partNumber")}</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="bg-gray-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.code")}</FormLabel>
                <FormControl>
                  <Input placeholder="A8908" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="machine_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maintenance.machineName")}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("maintenance.selectMachine")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(machines) && machines.length > 0 ? (
                      machines.map((machine: any) => {
                        const label =
                          machine.name_ar || machine.name || `#${machine.id}`;
                        return (
                          <SelectItem key={machine.id} value={label}>
                            {label} ({machine.id})
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no_machines">
                        {t("maintenance.noMachinesAvailable")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="part_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.partName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("maintenance.partNamePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maintenance.serialNumber")}</FormLabel>
                <FormControl>
                  <Input placeholder="E5SH973798" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maintenance.specifications")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("maintenance.specificationsPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? t("maintenance.updating") : t("maintenance.update")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
