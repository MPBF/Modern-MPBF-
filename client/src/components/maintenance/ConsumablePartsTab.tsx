import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  QrCode,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  insertConsumablePartSchema,
  insertConsumablePartTransactionSchema,
} from "../../../../shared/schema";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../../hooks/use-toast";
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

import type { TFunction } from "i18next";

import { apiRequest } from "../../lib/queryClient";

const createConsumablePartSchema = (t: TFunction) =>
  insertConsumablePartSchema.extend({
    current_quantity: z.coerce
      .number()
      .min(0, t("maintenance.consumable.validation.quantityMin"))
      .default(0),
    min_quantity: z.coerce.number().min(0).optional(),
    max_quantity: z.coerce.number().min(0).optional(),
  });

const createBarcodeTransactionSchema = (t: TFunction) =>
  insertConsumablePartTransactionSchema
    .extend({
      barcode: z
        .string()
        .min(1, t("maintenance.consumable.validation.barcodeRequired")),
      quantity: z.coerce
        .number()
        .min(1, t("maintenance.consumable.validation.quantityPositive")),
      manual_entry: z.boolean().default(false),
    })
    .omit({ consumable_part_id: true, performed_by: true });

type ConsumablePartFormData = z.infer<
  ReturnType<typeof createConsumablePartSchema>
>;
type BarcodeTransactionFormData = z.infer<
  ReturnType<typeof createBarcodeTransactionSchema>
>;

interface ConsumablePartsTabProps {
  consumableParts?: any[];
  isLoading?: boolean;
}

export default function ConsumablePartsTab({
  consumableParts: propParts,
  isLoading: propLoading,
}: ConsumablePartsTabProps) {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canAddMaint = canAddInArea(user, "maintenance");
  const canEditMaint = canEditInArea(user, "maintenance");
  const canDeleteMaint = canDeleteInArea(user, "maintenance");

  const consumablePartSchema = createConsumablePartSchema(t);
  const barcodeTransactionSchema = createBarcodeTransactionSchema(t);

  const {
    data: consumableParts,
    isLoading,
    isError: partsError,
  } = useQuery({
    queryKey: ["/api/consumable-parts"],
    enabled: !propParts,
  });

  const { data: transactions, isError: transactionsError } = useQuery({
    queryKey: ["/api/consumable-parts-transactions"],
  });

  const partsData = (propParts || consumableParts || []) as any[];
  const loading = propLoading || isLoading;

  const addForm = useForm<ConsumablePartFormData>({
    resolver: zodResolver(consumablePartSchema),
    defaultValues: {
      code: "",
      type: "",
      status: "active",
      current_quantity: 0,
      unit: "قطعة",
    },
  });

  const editForm = useForm<ConsumablePartFormData>({
    resolver: zodResolver(consumablePartSchema),
  });

  const transactionForm = useForm<BarcodeTransactionFormData>({
    resolver: zodResolver(barcodeTransactionSchema),
    defaultValues: {
      quantity: 1,
      transaction_type: "in",
      manual_entry: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ConsumablePartFormData) =>
      apiRequest("/api/consumable-parts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consumable-parts"] });
      toast({ title: t("maintenance.consumable.toast.addSuccess") });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: t("maintenance.consumable.toast.addFailed"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ConsumablePartFormData>;
    }) =>
      apiRequest(`/api/consumable-parts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consumable-parts"] });
      toast({ title: t("maintenance.consumable.toast.updateSuccess") });
      setIsEditDialogOpen(false);
      setEditingPart(null);
    },
    onError: () => {
      toast({
        title: t("maintenance.consumable.toast.updateFailed"),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/consumable-parts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consumable-parts"] });
      toast({ title: t("maintenance.consumable.toast.deleteSuccess") });
    },
    onError: () => {
      toast({
        title: t("maintenance.consumable.toast.deleteFailed"),
        variant: "destructive",
      });
    },
  });

  const transactionMutation = useMutation({
    mutationFn: (data: BarcodeTransactionFormData) => {
      if (!user?.id) {
        throw new Error(t("maintenance.consumable.loginRequired"));
      }

      const part = partsData.find((p: any) => p.barcode === data.barcode);
      if (!part) {
        throw new Error(t("maintenance.consumable.barcodeNotFound"));
      }

      return apiRequest("/api/consumable-parts-transactions/barcode", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          consumable_part_id: part.id,
          performed_by: user.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consumable-parts"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/consumable-parts-transactions"],
      });
      toast({ title: t("maintenance.consumable.toast.transactionSuccess") });
      setIsTransactionDialogOpen(false);
      transactionForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: t("maintenance.consumable.toast.transactionFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredParts = partsData.filter((part: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      part.code?.toLowerCase().includes(searchLower) ||
      part.type?.toLowerCase().includes(searchLower) ||
      String(part.part_id || "")
        .toLowerCase()
        .includes(searchLower) ||
      part.barcode?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (part: any) => {
    setEditingPart(part);
    editForm.reset({
      code: part.code || "",
      type: part.type || "",
      status: part.status || "active",
      notes: part.notes || "",
      location: part.location || "",
      unit: part.unit || "قطعة",
      current_quantity: part.current_quantity || 0,
      min_quantity: part.min_quantity || undefined,
      max_quantity: part.max_quantity || undefined,
      barcode: part.barcode || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("maintenance.consumable.confirmDelete"))) {
      deleteMutation.mutate(id);
    }
  };

  const onAddSubmit = (data: ConsumablePartFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: ConsumablePartFormData) => {
    if (editingPart) {
      updateMutation.mutate({ id: editingPart.id, data });
    }
  };

  const onTransactionSubmit = (data: BarcodeTransactionFormData) => {
    transactionMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("maintenance.consumable.statusActive")}
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            {t("maintenance.consumable.statusInactive")}
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="destructive">
            {t("maintenance.consumable.statusMaintenance")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQuantityStatus = (current: number, min?: number) => {
    if (min && current <= min) {
      return (
        <span className="text-red-600 font-semibold">
          {t("maintenance.consumable.quantityLow")}
        </span>
      );
    }
    return <span className="text-green-600">{current}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("maintenance.consumable.title")}</CardTitle>
          <div className="flex space-x-2 space-x-reverse">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("maintenance.consumable.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search"
              />
            </div>

            <Dialog
              open={isTransactionDialogOpen}
              onOpenChange={setIsTransactionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100"
                  data-testid="button-barcode"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {t("maintenance.consumable.barcodeTransaction")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t("maintenance.consumable.registerBarcodeTransaction")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("maintenance.consumable.barcodeTransactionDescription")}
                  </DialogDescription>
                </DialogHeader>
                <Form {...transactionForm}>
                  <form
                    onSubmit={transactionForm.handleSubmit(onTransactionSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={transactionForm.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.barcode")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                "maintenance.consumable.scanOrEnterBarcode",
                              )}
                              data-testid="input-barcode"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={transactionForm.control}
                        name="transaction_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.transactionType")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-transaction-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="in">
                                  {t("maintenance.consumable.transactionIn")}
                                </SelectItem>
                                <SelectItem value="out">
                                  {t("maintenance.consumable.transactionOut")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={transactionForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.quantity")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                data-testid="input-quantity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={transactionForm.control}
                      name="transaction_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.transactionReason")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder={t(
                                "maintenance.consumable.optionalReason",
                              )}
                              data-testid="input-reason"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transactionForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.notes")}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              placeholder={t(
                                "maintenance.consumable.additionalNotes",
                              )}
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 space-x-reverse">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsTransactionDialogOpen(false)}
                        data-testid="button-cancel-transaction"
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={transactionMutation.isPending}
                        data-testid="button-submit-transaction"
                      >
                        {transactionMutation.isPending
                          ? t("maintenance.consumable.registering")
                          : t("maintenance.consumable.registerTransaction")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              {canAddMaint && (
              <DialogTrigger asChild>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-add"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("maintenance.consumable.addPart")}
                </Button>
              </DialogTrigger>
              )}
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {t("maintenance.consumable.addNewPartTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("maintenance.consumable.addNewPartDescription")}
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form
                    onSubmit={addForm.handleSubmit(onAddSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.code")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t(
                                  "maintenance.consumable.partCodePlaceholder",
                                )}
                                data-testid="input-code"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.type")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t(
                                  "maintenance.consumable.partTypePlaceholder",
                                )}
                                data-testid="input-type"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={addForm.control}
                        name="current_quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.currentQuantity")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                data-testid="input-current-quantity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.unit")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-unit">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="قطعة">
                                  {t("maintenance.consumable.unitPiece")}
                                </SelectItem>
                                <SelectItem value="كيلو">
                                  {t("maintenance.consumable.unitKilo")}
                                </SelectItem>
                                <SelectItem value="متر">
                                  {t("maintenance.consumable.unitMeter")}
                                </SelectItem>
                                <SelectItem value="ليتر">
                                  {t("maintenance.consumable.unitLiter")}
                                </SelectItem>
                                <SelectItem value="علبة">
                                  {t("maintenance.consumable.unitBox")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.status")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">
                                  {t("maintenance.consumable.statusActive")}
                                </SelectItem>
                                <SelectItem value="inactive">
                                  {t("maintenance.consumable.statusInactive")}
                                </SelectItem>
                                <SelectItem value="maintenance">
                                  {t(
                                    "maintenance.consumable.statusMaintenance",
                                  )}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <AdvancedSection>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="barcode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("maintenance.consumable.barcode")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder={t(
                                    "maintenance.consumable.barcodeOptional",
                                  )}
                                  data-testid="input-barcode-add"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("maintenance.consumable.location")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder={t(
                                    "maintenance.consumable.storageLocation",
                                  )}
                                  data-testid="input-location"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="min_quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("maintenance.consumable.minQuantity")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    )
                                  }
                                  data-testid="input-min-quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addForm.control}
                          name="max_quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("maintenance.consumable.maxQuantity")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    )
                                  }
                                  data-testid="input-max-quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={addForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("maintenance.consumable.notes")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                data-testid="textarea-notes-add"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AdvancedSection>

                    <div className="flex justify-end space-x-2 space-x-reverse">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        data-testid="button-cancel-add"
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        data-testid="button-submit-add"
                      >
                        {createMutation.isPending
                          ? t("maintenance.consumable.saving")
                          : t("maintenance.consumable.addPart")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.code")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.type")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.barcode")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.currentQuantity")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.unit")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.location")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.consumable.status")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParts.length > 0 ? (
                  filteredParts.map((part: any) => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {part.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {part.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {part.barcode || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {getQuantityStatus(
                          part.current_quantity,
                          part.min_quantity,
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {part.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {part.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(part.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-1">
                          {canEditMaint && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(part)}
                            data-testid={`button-edit-${part.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          )}
                          {canDeleteMaint && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleDelete(part.id)}
                            data-testid={`button-delete-${part.id}`}
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
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {t("maintenance.consumable.noPartsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t("maintenance.consumable.editPartTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("maintenance.consumable.editPartDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.consumable.code")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.consumable.type")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="current_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.consumable.currentQuantity")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            data-testid="input-edit-current-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.consumable.unit")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-unit">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="قطعة">
                              {t("maintenance.consumable.unitPiece")}
                            </SelectItem>
                            <SelectItem value="كيلو">
                              {t("maintenance.consumable.unitKilo")}
                            </SelectItem>
                            <SelectItem value="متر">
                              {t("maintenance.consumable.unitMeter")}
                            </SelectItem>
                            <SelectItem value="ليتر">
                              {t("maintenance.consumable.unitLiter")}
                            </SelectItem>
                            <SelectItem value="علبة">
                              {t("maintenance.consumable.unitBox")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.consumable.status")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">
                              {t("maintenance.consumable.statusActive")}
                            </SelectItem>
                            <SelectItem value="inactive">
                              {t("maintenance.consumable.statusInactive")}
                            </SelectItem>
                            <SelectItem value="maintenance">
                              {t("maintenance.consumable.statusMaintenance")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <AdvancedSection>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.barcode")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              data-testid="input-edit-barcode"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.location")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              data-testid="input-edit-location"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="min_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.minQuantity")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                )
                              }
                              data-testid="input-edit-min-quantity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="max_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("maintenance.consumable.maxQuantity")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                )
                              }
                              data-testid="input-edit-max-quantity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("maintenance.consumable.notes")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-edit-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AdvancedSection>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    data-testid="button-submit-edit"
                  >
                    {updateMutation.isPending
                      ? t("maintenance.consumable.saving")
                      : t("maintenance.consumable.saveChanges")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
