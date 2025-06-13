import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Space, Badge, Tag, Card, Spin, Select } from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  ReloadOutlined,
  LeftCircleFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import EventDetailModal from "./EventDetailModal";
import "./IncidentManagement.scss";
import handleAPI from "../../../api/handleAPI";
import { errorToast, successToast } from "../../../utils/toastConfig";

const { Option } = Select;

function IncidentManagement({ t }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Lấy danh sách sự cố
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filters.type && filters.type !== "all" && { type: filters.type }),
        ...(filters.status &&
          filters.status !== "all" && { status: filters.status }),
      });

      const response = await handleAPI(
        `${apiEndpoint.eventlogs.getAllEventLogs}?${params}`,
        {},
        "GET"
      );
      if (response.success) {
        setEvents(response.data);
      } else {
        errorToast(t("IncidentManagement.loadError"));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      errorToast(t("IncidentManagement.loadError"));
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.status, t]);
  // Xác nhận sự cố
  const acknowledgeEvent = async (eventId) => {
    try {
      const response = await handleAPI(
        apiEndpoint.eventlogs.acknowledgeEventLog(eventId),
        {},
        "PUT"
      );
      if (response.success) {
        successToast(t("IncidentManagement.acknowledgeSuccess"));
        fetchEvents(); // Refresh data
      } else {
        errorToast(t("IncidentManagement.acknowledgeError"));
      }
    } catch (error) {
      console.error("Error acknowledging event:", error);
      errorToast(t("IncidentManagement.acknowledgeError"));
    }
  };
  // Xử lý thay đổi filter
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Xử lý xem chi tiết sự cố
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  // Đóng modal chi tiết
  const handleCloseDetailModal = () => {
    setSelectedEvent(null);
    setIsDetailModalOpen(false);
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  }; // Lấy badge cho trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge
            status="error"
            text={
              <span className="text-[1.4rem] text-white">
                {t("IncidentManagement.statusTypes.Active")}
              </span>
            }
          />
        );
      case "Cleared":
        return (
          <Badge
            status="success"
            text={
              <span className="text-[1.4rem] text-white">
                {t("IncidentManagement.statusTypes.Cleared")}
              </span>
            }
          />
        );
      default:
        return null; // Không hiển thị nếu không phải 2 trạng thái này
    }
  };
  // Lấy tag cho loại sự kiện
  const getEventTypeTag = (eventType) => {
    switch (eventType) {
      case "Fire Alarm":
        return (
          <Tag color="#f5222d" className="text-[1.4rem] px-3 py-1">
            {t("IncidentManagement.eventTypes.Fire Alarm")}
          </Tag>
        );
      case "Fault":
        return (
          <Tag color="#fa8c16" className="text-[1.4rem] px-3 py-1">
            {t("IncidentManagement.eventTypes.Fault")}
          </Tag>
        );
      default:
        return null; // Không hiển thị nếu không phải 2 loại này
    }
  };
  useEffect(() => {
    document.title = `Tinventor - ${t("IncidentManagement.title")}`;
    fetchEvents();

    return () => {
      document.title = "Tinventor - Fire Alarm Management System";
    };
  }, [filters, fetchEvents, t]);
  const eventTypes = ["Fire Alarm", "Fault"];
  const statusTypes = ["Active", "Cleared"];
  const columns = [
    {
      title: (
        <span className="text-[1.6rem] font-semibold">
          {t("IncidentManagement.timestamp")}
        </span>
      ),
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text) => (
        <span className="text-[1.4rem]">{formatDateTime(text)}</span>
      ),
      width: 160,
    },
    {
      title: (
        <span className="text-[1.6rem] font-semibold">
          {t("IncidentManagement.eventType")}
        </span>
      ),
      dataIndex: "event_type",
      key: "event_type",
      render: (type) => getEventTypeTag(type),
      width: 120,
    },
    {
      title: (
        <span className="text-[1.6rem] font-semibold">
          {t("IncidentManagement.description")}
        </span>
      ),
      dataIndex: "description",
      key: "description",
      render: (text) => <span className="text-[1.4rem]">{text}</span>,
      ellipsis: true,
      width: 300,
    },
    {
      title: (
        <span className="text-[1.6rem] font-semibold">
          {t("IncidentManagement.zone")}
        </span>
      ),
      dataIndex: "zoneId",
      key: "zoneId",
      render: (zone) => (
        <span className="text-[1.4rem]">{zone?.name || "-"}</span>
      ),
      width: 120,
    },
    {
      title: (
        <span className="text-[1.6rem] font-semibold">
          {t("IncidentManagement.status")}
        </span>
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
      width: 130,
    },
    {
      title: (
        <span className="text-[1.6rem] font-semibold">
          {t("IncidentManagement.actions")}
        </span>
      ),
      key: "actions",
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {record.status === "Active" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => acknowledgeEvent(record._id)}
              className="bg-green-500 hover:!bg-green-400 flex items-center w-full"
              size="small"
            >
              <span className="ml-1">
                {t("IncidentManagement.acknowledge")}
              </span>
            </Button>
          )}
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            className="bg-blue-500 hover:!bg-blue-400 flex items-center w-full"
            size="small"
          >
            <span className="ml-1">{t("IncidentManagement.viewDetails")}</span>
          </Button>{" "}
        </Space>
      ),
      width: 140,
    },
  ];
  return (
    <div className="p-4 lg:p-[5rem] incident-management-container">
      <div>
        <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8 incident-header">
          <div className="flex items-center gap-4 md:mb-0 mb-4">
            <Link to="/cai-dat">
              <LeftCircleFilled className="text-[2.5rem] text-white" />
            </Link>{" "}
            <h1 className="text-3xl font-bold text-white">
              {t("IncidentManagement.title")}
            </h1>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => fetchEvents()}
            className="bg-blue-600 hover:!bg-blue-700 text-white"
            size="large"
          >
            <span className="hidden sm:inline">
              {t("IncidentManagement.refresh")}
            </span>
            <span className="sm:hidden">
              {t("IncidentManagement.refreshMobile")}
            </span>
          </Button>
        </div>{" "}
        {/* Filters */}
        <Card className="mb-6 bg-[#434343] border border-white/10 filter-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 filter-grid">
            {" "}
            <div>
              <label className="block text-[1.4rem] font-medium text-white mb-2">
                {t("IncidentManagement.filters.type")}
              </label>{" "}
              <Select
                value={filters.type}
                onChange={(value) => handleFilterChange("type", value)}
                className="w-full filter-select"
                size="large"
                placeholder={t("IncidentManagement.filters.selectType")}
              >
                <Option key="all" value="all">
                  {t("IncidentManagement.filters.allTypes")}
                </Option>
                {eventTypes.map((type) => (
                  <Option key={type} value={type}>
                    {t(`IncidentManagement.eventTypes.${type}`)}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-[1.4rem] font-medium text-white mb-2">
                {t("IncidentManagement.filters.status")}
              </label>{" "}
              <Select
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                className="w-full filter-select"
              >
                <Option key="all" value="all">
                  {t("IncidentManagement.filters.allStatuses")}
                </Option>
                {statusTypes.map((status) => (
                  <Option key={status} value={status}>
                    {t(`IncidentManagement.statusTypes.${status}`)}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
        <Card className="incident-table-card bg-[#434343] border border-white/10">
          {" "}
          {loading ? (
            <div className="text-center py-16">
              <Spin size="large" />
              <p className="text-white mt-4 text-[1.6rem]">
                {t("IncidentManagement.loading")}
              </p>
            </div>
          ) : (
            <Table
              dataSource={events}
              columns={columns}
              rowKey="_id"
              scroll={{ x: 1000, y: 500 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) =>
                  t("IncidentManagement.pagination.total", { total }),
                responsive: true,
                showQuickJumper: true,
              }}
              className="custom-incident-table"
              size="middle"
            />
          )}
        </Card>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}

export default IncidentManagement;
