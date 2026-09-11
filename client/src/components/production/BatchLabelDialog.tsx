import { useQuery } from "@tanstack/react-query";
import { Loader2, Printer, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatNumberAr } from "../../../../shared/number-utils";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  computeUnitCount,
  printBatchLabels,
  type BatchLabelData,
  type BatchPackagingUnit,
} from "./BatchLabelPrint";

interface BatchLabelDialogProps {
  productionOrderId: number | null;
  onClose: () => void;
}

interface BatchLabelResponse extends BatchLabelData {
  packaging_units: BatchPackagingUnit[];
  net_quantity_kg?: string | number;
}

export default function BatchLabelDialog({
  productionOrderId,
  onClose,
}: BatchLabelDialogProps) {
  const { t } = useTranslation();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");

  const { data, isLoading, isError, error } = useQuery<BatchLabelResponse>({
    queryKey: [
      "/api/production-orders",
      productionOrderId,
      "batch-label-data",
    ],
    enabled: productionOrderId != null,
  });

  const packagingUnits = data?.packaging_units || [];

  useEffect(() => {
    if (!packagingUnits.length) {
      setSelectedUnitId("");
      return;
    }
    setSelectedUnitId((prev) => {
      if (prev && packagingUnits.some((u) => String(u.id) === prev)) {
        return prev;
      }
      return String(packagingUnits[0].id);
    });
  }, [packagingUnits]);

  const selectedUnit = useMemo(
    () => packagingUnits.find((u) => String(u.id) === selectedUnitId),
    [packagingUnits, selectedUnitId],
  );

  const unitCount = useMemo(
    () =>
      selectedUnit
        ? computeUnitCount(data?.net_quantity_kg, selectedUnit.unit_weight_kg)
        : 0,
    [selectedUnit, data?.net_quantity_kg],
  );

  const handlePrint = () => {
    if (!data || !selectedUnit || unitCount <= 0) return;
    printBatchLabels({
      data,
      packagingUnit: selectedUnit,
      unitCount,
    });
  };

  return (
    <Dialog
      open={productionOrderId != null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t("batch.printLabelTitle")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-destructive">
            {(error as any)?.message || t("batch.loadError")}
          </p>
        ) : data ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("batch.batchNumber")}
                </span>
                <span className="font-mono font-semibold">
                  {data.batch_number}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("batch.netQuantity")}
                </span>
                <span className="font-medium">
                  {formatNumberAr(parseFloat(String(data.net_quantity_kg ?? "0")), 2)}{" "}
                  {t("batch.kg")}
                </span>
              </div>
            </div>

            {packagingUnits.length === 0 ? (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {t("batch.noPackagingUnits")}
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t("batch.packagingUnit")}</Label>
                  <Select
                    value={selectedUnitId}
                    onValueChange={setSelectedUnitId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("batch.selectPackagingUnit")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {packagingUnits.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name} (
                          {formatNumberAr(parseFloat(String(u.unit_weight_kg)), 2)}{" "}
                          {t("batch.kg")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border p-3 text-center">
                  <div className="text-sm text-muted-foreground">
                    {t("batch.labelsToPrint")}
                  </div>
                  <div className="text-2xl font-bold">{unitCount}</div>
                </div>
              </>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!data || !selectedUnit || unitCount <= 0}
          >
            <Printer className="ml-2 h-4 w-4" />
            {t("batch.print")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
