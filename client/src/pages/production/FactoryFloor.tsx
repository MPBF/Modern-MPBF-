import { useTranslation } from "react-i18next";

import FactoryFloorMap from "../../components/factory/FactoryFloorMap";
import PageLayout from "../../components/layout/PageLayout";

export default function FactoryFloor() {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t("factory.title", "خريطة المصنع")}
      description={t(
        "factory.description",
        "عرض تفاعلي لأرضية المصنع وحالة الماكينات",
      )}
    >
      <FactoryFloorMap />
    </PageLayout>
  );
}
