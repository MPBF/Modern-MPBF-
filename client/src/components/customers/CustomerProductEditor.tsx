import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useToast } from "../../hooks/use-toast";

export type ProductForm = {
  category_id: string;
  item_id: string;
  size_caption: string;
  width: string;
  left_facing: string;
  right_facing: string;
  thickness: string;
  density: string;
  printing_cylinder: string;
  cutting_length_cm: string;
  raw_material: string;
  master_batch_id: string;
  is_printed: boolean;
  cutting_unit: string;
  punching: string;
  unit_weight_kg: string;
  unit_quantity: string;
  package_weight_kg: string;
  cliche_front_design: string;
  cliche_back_design: string;
  front_print_colors: string[];
  back_print_colors: string[];
  front_design_filename: string;
  back_design_filename: string;
  notes: string;
  status: string;
};

export type ProductPayload = Omit<
  ProductForm,
  "front_design_filename" | "back_design_filename"
>;

export const emptyProductForm: ProductForm = {
  category_id: "none",
  item_id: "none",
  size_caption: "",
  width: "",
  left_facing: "",
  right_facing: "",
  thickness: "",
  density: "0.95",
  printing_cylinder: "بدون طباعة",
  cutting_length_cm: "",
  raw_material: "",
  master_batch_id: "none",
  is_printed: false,
  cutting_unit: "كيلو",
  punching: "بدون",
  unit_weight_kg: "",
  unit_quantity: "",
  package_weight_kg: "",
  cliche_front_design: "",
  cliche_back_design: "",
  front_print_colors: ["", "", "", ""],
  back_print_colors: ["", "", "", ""],
  front_design_filename: "",
  back_design_filename: "",
  notes: "",
  status: "active",
};

const printingCylinderOptions = [
  { value: "بدون طباعة", label: "بدون طباعة" },
  ...Array.from({ length: 16 }, (_, index) => {
    const size = (index + 1) * 2 + 6;
    return { value: `${size}"`, label: `${size}"` };
  }),
  { value: '39"', label: '39"' },
];

function toText(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function toFourColors(value: unknown): string[] {
  const colors = Array.isArray(value) ? value : [];
  return [0, 1, 2, 3].map((index) =>
    typeof colors[index] === "string" ? colors[index] : "",
  );
}

export function productFormFromRecord(product: any): ProductForm {
  return {
    category_id: product?.category_id || "none",
    item_id: product?.item_id || "none",
    size_caption: toText(product?.size_caption),
    width: toText(product?.width),
    left_facing: toText(product?.left_facing),
    right_facing: toText(product?.right_facing),
    thickness: toText(product?.thickness),
    density: toText(product?.density || "0.95"),
    printing_cylinder: toText(product?.printing_cylinder || "بدون طباعة"),
    cutting_length_cm: toText(product?.cutting_length_cm),
    raw_material: toText(product?.raw_material),
    master_batch_id: toText(product?.master_batch_id || "none"),
    is_printed: product?.is_printed === true,
    cutting_unit: toText(product?.cutting_unit || "كيلو"),
    punching: toText(product?.punching || "بدون"),
    unit_weight_kg: toText(product?.unit_weight_kg),
    unit_quantity: toText(product?.unit_quantity),
    package_weight_kg: toText(product?.package_weight_kg),
    cliche_front_design: toText(product?.cliche_front_design),
    cliche_back_design: toText(product?.cliche_back_design),
    front_print_colors: toFourColors(product?.front_print_colors),
    back_print_colors: toFourColors(product?.back_print_colors),
    front_design_filename: "",
    back_design_filename: "",
    notes: toText(product?.notes),
    status: toText(product?.status || "active"),
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder,
  step,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Input
        type={type}
        step={step}
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        placeholder={placeholder}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={readOnly ? "bg-slate-100 text-slate-700" : "bg-white"}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

function PrintColorSquares({
  label,
  colors,
  onChange,
}: {
  label: string;
  colors: string[];
  onChange: (colors: string[]) => void;
}) {
  const normalized = toFourColors(colors);
  const update = (index: number, value: string) => {
    const next = [...normalized];
    next[index] = value;
    onChange(next);
  };

  return (
    <div className="mt-3">
      <Label className="text-sm text-slate-600">{label}</Label>
      <div className="mt-2 flex gap-2">
        {normalized.map((color, index) => (
          <div key={index} className="relative">
            <label
              className="flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-slate-300"
              style={{ backgroundColor: color || "transparent" }}
              title="اختيار اللون"
            >
              <input
                type="color"
                value={color || "#ffffff"}
                onChange={(event) => update(index, event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label={`${label} ${index + 1}`}
              />
              {!color && <span className="text-lg text-slate-400">+</span>}
            </label>
            {color && (
              <button
                type="button"
                onClick={() => update(index, "")}
                title="مسح اللون"
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageField({
  label,
  value,
  filename,
  onSelect,
  onClear,
}: {
  label: string;
  value: string;
  filename: string;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <div className="mt-1 space-y-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-700">
          <ImagePlus className="h-4 w-4" />
          {filename || (value ? "استبدال التصميم" : "رفع صورة التصميم")}
          <input
            type="file"
            accept="image/*,.jpeg,.jpg,.png,.gif,.bmp,.webp,.svg"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSelect(file);
              event.target.value = "";
            }}
          />
        </label>
        {value && (
          <div className="relative rounded-lg border bg-slate-50 p-2">
            <img
              src={value}
              alt={label}
              className="mx-auto max-h-36 max-w-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerProductEditor({
  form,
  setForm,
  categories,
  items,
  editing,
  pending,
  canSave,
  onSubmit,
  onCancel,
}: {
  form: ProductForm;
  setForm: Dispatch<SetStateAction<ProductForm>>;
  categories: any[];
  items: any[];
  editing: boolean;
  pending: boolean;
  canSave: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const masterBatchQuery = useQuery<any[]>({
    queryKey: ["/api/master-batch-colors"],
    queryFn: async () => {
      const response = await fetch("/api/master-batch-colors", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("تعذر تحميل ألوان الماستر باتش");
      const result = await response.json();
      return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
    },
  });

  const selectedCategory = categories.find(
    (category) => String(category.id) === form.category_id,
  );
  const categoryName = selectedCategory?.name_ar || "";
  const filteredItems = items.filter(
    (item) => String(item.category_id) === form.category_id,
  );
  const isSufra =
    categoryName === "سفرة بلاستيكية" ||
    categoryName === "سفرة بلاستيكية مطوية";
  const manualCuttingLength =
    isSufra || form.printing_cylinder === "بدون طباعة";

  const punchingOptions = useMemo(() => {
    if (categoryName === "أكياس علاقي") return ["علاقي", "علاقي هوك"];
    if (categoryName === "أكياس بنانة") return ["بنانة", "بنانة 6سم"];
    if (
      editing &&
      ["علاقي", "علاقي هوك", "بنانة", "بنانة 6سم"].includes(form.punching)
    ) {
      return ["بدون", "علاقي", "علاقي هوك", "بنانة", "بنانة 6سم"];
    }
    return ["بدون"];
  }, [categoryName, editing, form.punching]);

  useEffect(() => {
    const width = parseFloat(form.width) || 0;
    const right = parseFloat(form.right_facing) || 0;
    const left = parseFloat(form.left_facing) || 0;
    const length = parseFloat(form.cutting_length_cm) || 0;
    let caption = width > 0 ? `${width}` : "";
    if (right > 0) caption += `${caption ? "+" : ""}${right}`;
    if (left > 0) caption += `${caption ? "+" : ""}${left}`;
    if (length > 0) caption += `${caption ? "X" : ""}${length}`;
    setForm((previous) =>
      previous.size_caption === caption
        ? previous
        : { ...previous, size_caption: caption },
    );
  }, [
    form.width,
    form.right_facing,
    form.left_facing,
    form.cutting_length_cm,
    setForm,
  ]);

  useEffect(() => {
    const unitWeight = parseFloat(form.unit_weight_kg);
    const quantity = parseInt(form.unit_quantity, 10);
    const packageWeight =
      Number.isFinite(unitWeight) && unitWeight > 0 && quantity > 0
        ? (unitWeight * quantity).toFixed(3)
        : "";
    setForm((previous) =>
      previous.package_weight_kg === packageWeight
        ? previous
        : { ...previous, package_weight_kg: packageWeight },
    );
  }, [form.unit_weight_kg, form.unit_quantity, setForm]);

  const computedBagMetrics = useMemo(() => {
    const number = (value: string) => {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const width = number(form.width);
    const left = number(form.left_facing);
    const right = number(form.right_facing);
    const length = number(form.cutting_length_cm);
    const thickness = number(form.thickness);
    const density = number(form.density) > 0 ? number(form.density) : 0.95;
    const universalMicrons = Math.ceil(
      left > 0 && right > 0 ? (thickness / 4) * 10 : (thickness / 2) * 10,
    );
    const grams =
      (width + left + right) *
      length *
      2 *
      (universalMicrons * 1e-4) *
      density;
    return grams > 0
      ? {
          bagWeightGrams: String(Math.ceil(grams)),
          bagsPerKilo: String(Math.ceil(1000 / grams)),
        }
      : { bagWeightGrams: "", bagsPerKilo: "" };
  }, [
    form.width,
    form.left_facing,
    form.right_facing,
    form.cutting_length_cm,
    form.thickness,
    form.density,
  ]);

  const setValue = <Key extends keyof ProductForm>(
    key: Key,
    value: ProductForm[Key],
  ) => setForm((previous) => ({ ...previous, [key]: value }));

  const selectCylinder = (value: string) => {
    const next: Partial<ProductForm> = {
      printing_cylinder: value,
      is_printed: value !== "بدون طباعة",
    };
    if (!isSufra) {
      if (value === "بدون طباعة") {
        next.cutting_length_cm = "";
      } else {
        const cylinder = parseInt(value.replace(/\D/g, ""), 10);
        if (cylinder) next.cutting_length_cm = String(Math.round(cylinder * 2.54));
      }
    }
    setForm((previous) => ({ ...previous, ...next }));
  };

  const uploadImage = (side: "front" | "back", file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير",
        description: "الحد الأقصى لحجم صورة التصميم هو 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        [side === "front" ? "cliche_front_design" : "cliche_back_design"]:
          String(reader.result || ""),
        [side === "front" ? "front_design_filename" : "back_design_filename"]:
          file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <Section title="التصنيف والصنف">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="الفئة"
            value={form.category_id}
            placeholder="اختر الفئة"
            onChange={(value) =>
              setForm((previous) => ({
                ...previous,
                category_id: value,
                item_id: "none",
                punching:
                  categories.find((entry) => String(entry.id) === value)?.name_ar ===
                  "أكياس علاقي"
                    ? "علاقي"
                    : categories.find((entry) => String(entry.id) === value)?.name_ar ===
                        "أكياس بنانة"
                      ? "بنانة"
                      : "بدون",
              }))
            }
          >
            <SelectItem value="none">اختر الفئة</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name_ar || category.name} ({category.id})
              </SelectItem>
            ))}
          </FormSelect>
          <FormSelect
            label="الصنف"
            value={form.item_id}
            placeholder={
              form.category_id === "none" ? "اختر الفئة أولاً" : "اختر الصنف"
            }
            disabled={form.category_id === "none"}
            onChange={(value) => setValue("item_id", value)}
          >
            <SelectItem value="none">اختر الصنف</SelectItem>
            {filteredItems.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name_ar || item.name} ({item.code})
              </SelectItem>
            ))}
          </FormSelect>
        </div>
      </Section>

      <Section title="مواصفات المنتج">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="مقاس المنتج (يُنشأ تلقائياً)"
            value={form.size_caption}
            readOnly
            placeholder="يُنشأ من الأبعاد"
          />
          <FormSelect
            label="التخريم"
            value={punchingOptions.includes(form.punching) ? form.punching : punchingOptions[0]}
            placeholder="اختر نوع التخريم"
            onChange={(value) => setValue("punching", value)}
          >
            {punchingOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </FormSelect>
        </div>
      </Section>

      <Section title="الأبعاد والقياسات">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="الثنية اليمنى" type="number" step="0.01" value={form.right_facing} onChange={(value) => setValue("right_facing", value)} />
          <Field label="العرض" type="number" step="0.01" value={form.width} onChange={(value) => setValue("width", value)} />
          <Field label="الثنية اليسرى" type="number" step="0.01" value={form.left_facing} onChange={(value) => setValue("left_facing", value)} />
          <Field label="السماكة" type="number" step="0.001" value={form.thickness} onChange={(value) => setValue("thickness", value)} />
          <Field label="الكثافة" type="number" step="0.001" value={form.density} onChange={(value) => setValue("density", value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="وزن الكيس (جم)" value={computedBagMetrics.bagWeightGrams || "—"} readOnly />
          <Field label="عدد الأكياس / كيلو" value={computedBagMetrics.bagsPerKilo || "—"} readOnly />
        </div>
      </Section>

      <Section title="مواصفات الطباعة والتقطيع">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormSelect label="أسطوانة الطباعة" value={form.printing_cylinder} placeholder="اختر الأسطوانة" onChange={selectCylinder}>
            {printingCylinderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </FormSelect>
          <Field label="طول القطع (سم)" type="number" value={form.cutting_length_cm} readOnly={!manualCuttingLength} placeholder={manualCuttingLength ? "أدخل طول القطع" : "يُحسب تلقائياً"} onChange={(value) => setValue("cutting_length_cm", value)} />
          <div className="flex items-center gap-3 rounded-md bg-slate-100 p-3 sm:mt-6">
            <input type="checkbox" checked={form.is_printed} disabled className="h-4 w-4 rounded" />
            <Label className="text-sm text-slate-600">المنتج مطبوع</Label>
          </div>
          <FormSelect label="وحدة التقطيع" value={form.cutting_unit || "none"} placeholder="اختر الوحدة" onChange={(value) => setValue("cutting_unit", value === "none" ? "" : value)}>
            <SelectItem value="none">اختر الوحدة</SelectItem>
            <SelectItem value="كيلو">كيلو / Kg</SelectItem>
            <SelectItem value="باكت">باكت / PKT</SelectItem>
            <SelectItem value="كيس">كيس / Pecs</SelectItem>
            <SelectItem value="رول">رول / Roll</SelectItem>
            <SelectItem value="كرتون">كرتون / Box</SelectItem>
            <SelectItem value="بندل">بندل / Bundle</SelectItem>
          </FormSelect>
        </div>
      </Section>

      <Section title="المواد والخامات">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="المادة الخام" value={form.raw_material || "none"} placeholder="اختر المادة الخام" onChange={(value) => setValue("raw_material", value === "none" ? "" : value)}>
            <SelectItem value="none">اختر المادة الخام</SelectItem>
            <SelectItem value="HDPE">HDPE</SelectItem>
            <SelectItem value="LDPE">LDPE</SelectItem>
            <SelectItem value="Regrind">Regrind</SelectItem>
          </FormSelect>
          <FormSelect label="لون الماستر باتش" value={form.master_batch_id || "none"} placeholder="اختر اللون" onChange={(value) => setValue("master_batch_id", value)}>
            <SelectItem value="none">بدون لون</SelectItem>
            {(masterBatchQuery.data || [])
              .filter((color) => color.is_active !== false)
              .map((color) => (
                <SelectItem key={color.id} value={String(color.id)}>
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.color_hex }} />
                    {color.name_ar || color.name} ({color.id})
                  </span>
                </SelectItem>
              ))}
          </FormSelect>
        </div>
      </Section>

      <Section title="الأوزان والكميات">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="وزن الوحدة (كجم)" type="number" step="0.001" value={form.unit_weight_kg} onChange={(value) => setValue("unit_weight_kg", value)} />
          <Field label="التعبئة / عدد الوحدات" type="number" value={form.unit_quantity} onChange={(value) => setValue("unit_quantity", value)} />
          <Field label="وزن العبوة (تلقائي)" type="number" value={form.package_weight_kg} readOnly placeholder="وزن الوحدة × العدد" />
        </div>
      </Section>

      <Section title="الكليشيهات والتصاميم">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <ImageField
              label="التصميم الأمامي"
              value={form.cliche_front_design}
              filename={form.front_design_filename}
              onSelect={(file) => uploadImage("front", file)}
              onClear={() => setForm((previous) => ({ ...previous, cliche_front_design: "", front_design_filename: "" }))}
            />
            <PrintColorSquares label="ألوان طباعة الوجه الأمامي" colors={form.front_print_colors} onChange={(colors) => setValue("front_print_colors", colors)} />
          </div>
          <div>
            <ImageField
              label="التصميم الخلفي"
              value={form.cliche_back_design}
              filename={form.back_design_filename}
              onSelect={(file) => uploadImage("back", file)}
              onClear={() => setForm((previous) => ({ ...previous, cliche_back_design: "", back_design_filename: "" }))}
            />
            <PrintColorSquares label="ألوان طباعة الوجه الخلفي" colors={form.back_print_colors} onChange={(colors) => setValue("back_print_colors", colors)} />
          </div>
        </div>
      </Section>

      <Section title="معلومات إضافية">
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">ملاحظات</Label>
            <Textarea value={form.notes} onChange={(event) => setValue("notes", event.target.value)} className="min-h-24 bg-white" />
          </div>
          <FormSelect label="الحالة" value={form.status} placeholder="اختر الحالة" onChange={(value) => setValue("status", value)}>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="inactive">غير فعال</SelectItem>
          </FormSelect>
        </div>
      </Section>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
        {editing && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={pending || !canSave}>
          {pending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          {editing ? "حفظ التعديلات" : "حفظ المنتج"}
        </Button>
      </div>
    </form>
  );
}