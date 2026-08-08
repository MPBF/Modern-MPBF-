import { useState } from "react";

import PageLayout from "../../components/layout/PageLayout";
import RollCreationModal from "../../components/modals/RollCreationModal";
import ProductionTabs from "../../components/production/ProductionTabs";

export default function Production() {
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [selectedProductionOrderId, setSelectedProductionOrderId] = useState<
    number | undefined
  >();

  const handleCreateRoll = (productionOrderId?: number) => {
    setSelectedProductionOrderId(productionOrderId);
    setIsRollModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRollModalOpen(false);
    setSelectedProductionOrderId(undefined);
  };

  return (
    <PageLayout className="p-2 md:p-4">
      <ProductionTabs onCreateRoll={handleCreateRoll} />

      <RollCreationModal
        isOpen={isRollModalOpen}
        onClose={handleCloseModal}
        selectedProductionOrderId={selectedProductionOrderId}
      />
    </PageLayout>
  );
}
