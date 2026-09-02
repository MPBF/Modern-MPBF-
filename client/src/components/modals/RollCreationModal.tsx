// src/components/RollCreationModal.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  safeParseFloat,
  formatNumberAr,
} from "../../../../shared/number-utils";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { Button } from "../ui/button";
import {
  Dialog,
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import type { ProductionOrder, Machine } from "../../../../shared/schema";

interface RollCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductionOrderId?: number;
}

// Note: keep weight as string in the form to play nicely with <input type="number">,
// but ensure it is a positive numeric string.
const rollFormSchema = z.object({
  production_order_id: z.preprocess(
    (v) => {
      if (typeof v === "string") {
        const n = Number.parseInt(v, 10);
        return Number.isNaN(n) ? undefined : n;
      }
      if (typeof v === "number") return v;
      return undefined;
    },
    z
      .number({ required_error: "يرجى اختيار أمر الإنتاج" })
      .int()
      .positive("يرجى اختيار أمر الإنتاج"),
  ),
  weight_kg: z
    .string()
    .min(1, "يرجى إدخال الوزن")
    .refine((val) => {
      const num = safeParseFloat(val.replace(",", "."), -1);
      return num > 0;
    }, "الوزن يجب أن يكون رقمًا أكبر من 0"),
  film_machine_id: z.string().min(1, "يرجى اختيار ماكينة الفيلم"),
});

export type RollFormData = z.infer<typeof rollFormSchema>;

export default function RollCreationModal({
  isOpen,
  onClose,
  selectedProductionOrderId,
}: RollCreationModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RollFormData>({
    resolver: zodResolver(rollFormSchema),
    defaultValues: {
      production_order_id:
        selectedProductionOrderId && selectedProductionOrderId > 0
          ? selectedProductionOrderId
          : undefined,
      weight_kg: "",
      film_machine_id: "",
    },
    mode: "onChange",
  });

  // Fetch lists only when the modal is open → snappier app.
  const { data: productionOrders = [], isLoading: productionOrdersLoading } =
    useQuery<ProductionOrder[]>({
      queryKey: ["/api/production-orders"],
      enabled: isOpen,
    });

  const { data: machines = [], isLoading: machinesLoading } = useQuery<
    Machine[]
  >({
    queryKey: ["/api/machines"],
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sections = [] } = useQuery<any[]>({
    queryKey: ["/api/sections"],
    enabled: isOpen,
    staleTime: 10 * 60 * 1000,
  });

  const { data: rolls = [] } = useQuery<any[]>({
    queryKey: ["/api/rolls"],
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const selectedOrder = useMemo(
    () =>
      productionOrders.find(
        (o) =>
          o.id ===
          (selectedProductionOrderId ?? form.getValues("production_order_id")),
      ) || null,
    [productionOrders, selectedProductionOrderId],
  );

  // Remaining quantity for the chosen order
  const remainingQuantity = useMemo(() => {
    if (!selectedOrder || !selectedOrder.quantity_kg) return 0;
    const required =
      Number.parseFloat(String((selectedOrder as any).quantity_kg)) || 0;
    const orderRolls = (rolls || []).filter(
      (r: any) => r.production_order_id === selectedOrder.id,
    );
    const produced = orderRolls.reduce(
      (sum: number, r: any) =>
        sum + (Number.parseFloat(String(r.weight_kg)) || 0),
      0,
    );
    return Math.max(0, required - produced);
  }, [selectedOrder, rolls]);

  // Keep form values in sync when the modal opens or the selected order changes
  useEffect(() => {
    if (!isOpen) return;
    // Ensure production order id is populated
    if (selectedProductionOrderId && selectedProductionOrderId > 0) {
      form.setValue("production_order_id", selectedProductionOrderId, {
        shouldValidate: true,
      });
    } else if (
      !form.getValues("production_order_id") &&
      productionOrders.length > 0
    ) {
      form.setValue("production_order_id", productionOrders[0].id, {
        shouldValidate: true,
      });
    }

    // Prefill weight by the remaining quantity if available and the user hasn't typed anything
    const currentWeight = form.getValues("weight_kg");
    if (!currentWeight && remainingQuantity > 0) {
      form.setValue("weight_kg", String(remainingQuantity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    selectedProductionOrderId,
    productionOrders.length,
    remainingQuantity,
  ]);

  const createRollMutation = useMutation({
    mutationFn: async (data: RollFormData) => {
      const weightParsed = Number.parseFloat(data.weight_kg.replace(",", "."));
      const response = await apiRequest("/api/rolls", {
        method: "POST",
        body: JSON.stringify({
          production_order_id: data.production_order_id,
          weight_kg: weightParsed,
          film_machine_id: data.film_machine_id,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || t("modals.rollCreation.requestFailed"));
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("modals.rollCreation.createSuccess"),
        description: `${t("modals.rollCreation.rollNumberLabel")}: ${data.roll_number}`,
      });
      // Invalidate related caches succinctly
      [
        "/api/rolls",
        "/api/production-orders",
        "/api/production/film-queue",
        "/api/production/hierarchical-orders",
        "/api/production/printing-queue",
        "/api/production/cutting-queue",
        "/api/production/grouped-cutting-queue",
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

      onClose();
      form.reset();
    },
    onError: (error: unknown) => {
      console.error("Roll creation error:", error);
      let errorMessage = t("modals.rollCreation.createFailed");
      if (error instanceof Error) {
        const msg = error.message || "";
        if (/Network error|Failed to fetch/i.test(msg)) {
          errorMessage = t("modals.rollCreation.networkError");
        } else if (/Validation|Invalid/i.test(msg)) {
          errorMessage = t("modals.rollCreation.validationError");
        } else if (/Conflict|already exists/i.test(msg)) {
          errorMessage = t("modals.rollCreation.conflictError");
        } else {
          errorMessage = msg;
        }
      }
      toast({
        title: t("modals.rollCreation.createErrorTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RollFormData) => {
    const weightParsed = safeParseFloat(data.weight_kg.replace(",", "."), 0);
    if (remainingQuantity > 0 && weightParsed > remainingQuantity + 0.0001) {
      toast({
        title: t("modals.rollCreation.weightExceedsRemaining"),
        description: `${t("modals.rollCreation.remainingQuantityLabel")}: ${formatNumberAr(remainingQuantity, 2)} ${t("modals.rollCreation.kg")}`,
        variant: "destructive",
      });
      return;
    }
    createRollMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createRollMutation.isPending) {
      onClose();
      form.reset();
    }
  };

  // Filter machines by section
  const filmSectionMachines = useMemo(() => {
    if (!sections.length || !machines.length) return [];
    const filmSection = sections.find((s: any) =>
      [s.name, s.name_ar]
        .filter(Boolean)
        .map((x: string) => x.toLowerCase())
        .some((n: string) => n.includes("film") || n.includes("فيلم")),
    );
    if (!filmSection) return [];
    return (machines as any[]).filter(
      (m: any) =>
        m.section_id === filmSection.id && m.status === "active" && m.id,
    );
  }, [machines, sections]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="max-w-md"
        aria-describedby="roll-creation-description"
      >
        <DialogHeader>
          <DialogTitle>{t("modals.rollCreation.title")}</DialogTitle>
          <DialogDescription id="roll-creation-description">
            {t("modals.rollCreation.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!selectedProductionOrderId && (
              <FormField
                control={form.control}
                name="production_order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("modals.rollCreation.productionOrder")}
                    </FormLabel>
                    <Select
                      value={
                        field.value != null ? String(field.value) : undefined
                      }
                      onValueChange={(value) => field.onChange(value)}
                      disabled={productionOrdersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "modals.rollCreation.selectProductionOrder",
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productionOrdersLoading ? (
                          <SelectItem value="loading" disabled>
                            {t("modals.rollCreation.loading")}
                          </SelectItem>
                        ) : productionOrders.length ? (
                          productionOrders
                            .filter((order) => order.id)
                            .map((order) => (
                              <SelectItem
                                key={order.id}
                                value={String(order.id)}
                              >
                                {order.production_order_number} -{" "}
                                {(order as any).customer_name_ar ||
                                  (order as any).customer_name ||
                                  t("modals.rollCreation.notSpecified")}{" "}
                                -{" "}
                                {(order as any).item_name_ar ||
                                  (order as any).item_name ||
                                  (order as any).size_caption ||
                                  t("modals.rollCreation.notSpecified")}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            {t("modals.rollCreation.noProductionOrders")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedProductionOrderId && (
              <div className="space-y-2">
                <Label>
                  {t("modals.rollCreation.selectedProductionOrder")}
                </Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="font-medium text-sm">
                    {selectedOrder?.production_order_number ||
                      `PO-${selectedProductionOrderId}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {`${(selectedOrder as any)?.customer_name_ar || (selectedOrder as any)?.customer_name || t("modals.rollCreation.notSpecified")} - ${(selectedOrder as any)?.item_name_ar || (selectedOrder as any)?.item_name || (selectedOrder as any)?.size_caption || t("modals.rollCreation.notSpecified")}`}
                  </p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="weight_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.rollCreation.weightKg")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      inputMode="decimal"
                      placeholder="45.2"
                      className="text-right"
                      data-testid="input-weight_kg"
                      {...field}
                    />
                  </FormControl>
                  {selectedOrder && (
                    <p className="text-xs text-gray-600">
                      {t("modals.rollCreation.remainingQuantityLabel")}:{" "}
                      <span className="font-medium">
                        {formatNumberAr(remainingQuantity, 2)}{" "}
                        {t("modals.rollCreation.kg")}
                      </span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="film_machine_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.rollCreation.filmMachine")}</FormLabel>
                  <Select
                    value={
                      field.value != null ? String(field.value) : undefined
                    }
                    onValueChange={(value) => field.onChange(value)}
                    disabled={machinesLoading}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-film-machine">
                        <SelectValue
                          placeholder={t(
                            "modals.rollCreation.selectFilmMachine",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {machinesLoading ? (
                        <SelectItem value="loading" disabled>
                          {t("modals.rollCreation.loading")}
                        </SelectItem>
                      ) : filmSectionMachines.length ? (
                        filmSectionMachines.map((machine: any) => (
                          <SelectItem
                            key={String(machine.id)}
                            value={String(machine.id)}
                          >
                            {machine.name_ar || machine.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {t("modals.rollCreation.noFilmMachines")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 rtl:space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createRollMutation.isPending}
              >
                {t("modals.rollCreation.cancel")}
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={
                  createRollMutation.isPending || remainingQuantity === 0
                }
              >
                {createRollMutation.isPending
                  ? t("modals.rollCreation.creating")
                  : remainingQuantity === 0
                    ? t("modals.rollCreation.quantityComplete")
                    : t("modals.rollCreation.createRoll")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
