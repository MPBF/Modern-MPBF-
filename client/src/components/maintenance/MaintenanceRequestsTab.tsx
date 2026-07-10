import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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

import MaintenanceRequestDialog from "./MaintenanceRequestDialog";
import { getStatusColor, getStatusText } from "./maintenanceStatus";

export default function MaintenanceRequestsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canAddMaint = canAddInArea(user, "maintenance");
  const canEditMaint = canEditInArea(user, "maintenance");
  const canDeleteMaint = canDeleteInArea(user, "maintenance");

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<any>(null);
  const [requestToDelete, setRequestToDelete] = useState<any>(null);

  const { data: maintenanceRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/maintenance-requests"],
  });
  const { data: machines } = useQuery({ queryKey: ["/api/machines"] });
  const { data: users } = useQuery({ queryKey: ["/api/users"] });

  const createRequestMutation = useMutation({
    mutationFn: (data: any) => {
      const requestData = {
        ...data,
        reported_by: user?.id?.toString() || "",
      };
      return apiRequest("/api/maintenance-requests", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-requests"],
      });
      setIsRequestDialogOpen(false);
      toast({ title: t("maintenance.toast.requestCreated") });
    },
    onError: (error) => {
      console.error("Error creating maintenance request:", error);
      toast({
        title: t("maintenance.toast.requestCreateFailed"),
        variant: "destructive",
      });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/maintenance-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-requests"],
      });
      setRequestToEdit(null);
      toast({ title: t("maintenance.toast.requestUpdated") });
    },
    onError: (error) => {
      console.error("Error updating maintenance request:", error);
      toast({
        title: t("maintenance.toast.requestUpdateFailed"),
        variant: "destructive",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/maintenance-requests/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-actions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/maintenance-reports"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/operator-negligence-reports"],
      });
      setRequestToDelete(null);
      toast({ title: t("maintenance.toast.requestDeleted") });
    },
    onError: (error) => {
      console.error("Error deleting maintenance request:", error);
      toast({
        title: t("maintenance.toast.requestDeleteFailed"),
        variant: "destructive",
      });
    },
  });

  return (
    <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("maintenance.tabs.requests")}</CardTitle>
                <Dialog
                  open={isRequestDialogOpen}
                  onOpenChange={setIsRequestDialogOpen}
                >
                  {canAddMaint && (
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("maintenance.newRequest")}
                    </Button>
                  </DialogTrigger>
                  )}
                  <MaintenanceRequestDialog
                    machines={machines}
                    users={users}
                    onSubmit={createRequestMutation.mutate}
                    isLoading={createRequestMutation.isPending}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
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
                          {t("maintenance.requestNumber")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("maintenance.machineName")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("maintenance.maintenanceType")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("maintenance.urgencyLevel")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("common.status")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("maintenance.issueDescription")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("maintenance.technician")}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {t("common.date")}
                        </th>
                        {(canEditMaint || canDeleteMaint) && (
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            {t("common.actions")}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(maintenanceRequests) &&
                      maintenanceRequests.length > 0 ? (
                        maintenanceRequests.map((request: any) => {
                          const machine = Array.isArray(machines)
                            ? machines.find(
                                (m: any) => m.id === request.machine_id,
                              )
                            : null;
                          const machineName = machine
                            ? machine.name_ar || machine.name
                            : request.machine_id;

                          const assignedUser =
                            Array.isArray(users) && request.assigned_to
                              ? users.find(
                                  (u: any) =>
                                    u.id.toString() ===
                                    request.assigned_to.toString(),
                                )
                              : null;
                          const assignedName = assignedUser
                            ? assignedUser.full_name || assignedUser.username
                            : t("maintenance.notAssigned");

                          return (
                            <tr key={request.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                {request.request_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {machineName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {request.issue_type === "mechanical"
                                  ? t("maintenance.issueType.mechanical")
                                  : request.issue_type === "electrical"
                                    ? t("maintenance.issueType.electrical")
                                    : t("maintenance.issueType.other")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <Badge
                                  variant={
                                    request.urgency_level === "urgent"
                                      ? "destructive"
                                      : request.urgency_level === "medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {request.urgency_level === "urgent"
                                    ? t("maintenance.urgency.urgent")
                                    : request.urgency_level === "medium"
                                      ? t("maintenance.urgency.medium")
                                      : t("maintenance.urgency.normal")}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                                >
                                  {getStatusText(request.status, t)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate text-center">
                                {request.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {assignedName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                {new Date(
                                  request.date_reported,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </td>
                              {(canEditMaint || canDeleteMaint) && (
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {canEditMaint && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700"
                                        onClick={() => setRequestToEdit(request)}
                                        title={t("common.edit")}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canDeleteMaint && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() =>
                                          setRequestToDelete(request)
                                        }
                                        title={t("common.delete")}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={canEditMaint || canDeleteMaint ? 9 : 8}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            {t("maintenance.noRequests")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit maintenance request */}
          <Dialog
            open={!!requestToEdit}
            onOpenChange={(open) => !open && setRequestToEdit(null)}
          >
            {requestToEdit && (
              <MaintenanceRequestDialog
                machines={machines}
                users={users}
                initialValues={requestToEdit}
                onSubmit={(data: any) =>
                  updateRequestMutation.mutate({
                    id: requestToEdit.id,
                    data,
                  })
                }
                isLoading={updateRequestMutation.isPending}
              />
            )}
          </Dialog>

          {/* Delete maintenance request confirmation */}
          <Dialog
            open={!!requestToDelete}
            onOpenChange={(open) => !open && setRequestToDelete(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("maintenance.deleteRequestTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("maintenance.deleteRequestConfirm", {
                    number: requestToDelete?.request_number ?? "",
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRequestToDelete(null)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteRequestMutation.isPending}
                  onClick={() =>
                    requestToDelete &&
                    deleteRequestMutation.mutate(requestToDelete.id)
                  }
                >
                  {deleteRequestMutation.isPending
                    ? t("common.deleting")
                    : t("common.delete")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
    </>
  );
}
