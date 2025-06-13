import React from "react";
import { useTranslation } from "react-i18next";

function EventDetailModal({ event, isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen || !event) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-red-600 bg-red-100";
      case "Cleared":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "Fire Alarm":
        return "text-red-700 bg-red-200";
      case "Fault":
        return "text-orange-700 bg-orange-200";
      default:
        return "text-blue-700 bg-blue-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[2.5rem] leading-6 font-medium text-gray-900 mb-5">
                {t("IncidentManagement.details")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}{" "}
              <div className="space-y-4">
                {" "}
                <h4 className="font-semibold text-gray-800 border-b pb-2">
                  {t("common.basicInfo")}
                </h4>
                <div>
                  <label className="block text-[1.6rem] font-medium text-gray-600">
                    {t("IncidentManagement.timestamp")}
                  </label>
                  <p className="mt-1 text-[1.4rem] text-gray-900">
                    {formatDateTime(event.timestamp)}
                  </p>
                </div>
                <div>
                  <label className="block text-[1.6rem] font-medium text-gray-600">
                    {t("IncidentManagement.eventType")}
                  </label>
                  <span
                    className={`inline-flex px-4 py-1 text-[1.4rem] font-semibold rounded-full mt-1 ${getEventTypeColor(
                      event.event_type
                    )}`}
                  >
                    {t(`IncidentManagement.eventTypes.${event.event_type}`)}
                  </span>
                </div>{" "}
                <div>
                  <label className="block text-[1.6rem] font-medium text-gray-600">
                    {t("IncidentManagement.status")}
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-[1.4rem] font-semibold rounded-full mt-1 ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {t(`IncidentManagement.statusTypes.${event.status}`)}
                  </span>
                </div>
                <div>
                  <label className="block text-[1.6rem] font-medium text-gray-600">
                    {t("IncidentManagement.sourceType")}
                  </label>
                  <p className="mt-1 text-[1.4rem] text-gray-900">
                    {event.source_type
                      ? t(`IncidentManagement.sourceTypes.${event.source_type}`)
                      : "-"}
                  </p>
                </div>{" "}
              </div>
              {/* Location and Status Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">
                  {t("common.locationInfo")}
                </h4>
                <div>
                  <label className="block text-[1.6rem] font-medium text-gray-600">
                    {t("IncidentManagement.zone")}
                  </label>
                  <p className="mt-1 text-[1.4rem] text-gray-900">
                    {event.zoneId?.name || "-"}
                  </p>
                </div>{" "}
                <div>
                  <label className="block text-[1.6rem] font-medium text-gray-600">
                    {t("IncidentManagement.panel")}
                  </label>
                  <p className="mt-1 text-[1.4rem] text-gray-900">
                    {event.panelId?.name || "-"}
                  </p>
                </div>
                {event.acknowledged_at && (
                  <div>
                    <label className="block text-[1.6rem] font-medium text-gray-600">
                      {t("IncidentManagement.acknowledgedAt")}
                    </label>
                    <p className="mt-1 text-[1.4rem] text-gray-900">
                      {formatDateTime(event.acknowledged_at)}
                    </p>
                  </div>
                )}
                {event.details.detector_address && (
                  <div>
                    <label className="block text-[1.6rem] font-medium text-gray-600">
                      {t("IncidentManagement.detectorAddress")}
                    </label>
                    <p className="mt-1 text-[1.4rem] text-gray-900 font-mono">
                      {event.details.detector_address}
                    </p>
                  </div>
                )}
                {event.acknowledged_by_user_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      {t("IncidentManagement.acknowledgedBy")}
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {event.acknowledged_by_user_id}
                    </p>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Description */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-300 pb-2">
                {t("IncidentManagement.description")}
              </h4>
              <p className="mt-2 text-[1.4rem] text-gray-900 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
            {/* Details */}
            {event.details && Object.keys(event.details).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 border-b border-gray-300 pb-2">
                  {t("common.detail")}
                </h4>
                <div className="mt-2 bg-gray-100 rounded-lg p-3 border border-gray-200">
                  <pre className="text-[1.4rem] text-gray-800 overflow-x-auto">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>{" "}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-[1.8rem] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-[1.8rem]"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;
