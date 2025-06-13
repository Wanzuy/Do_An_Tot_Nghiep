import React, { useState, useEffect } from "react";
import { Modal, Spin, List, Button, Tag, Empty, Checkbox, Tabs } from "antd";
import {
  LinkOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  ApiOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import { successToast, errorToast } from "../../../../utils/toastConfig";

const AssignDeviceModal = ({ t, isOpen, onClose, zone, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [unassignedDetectors, setUnassignedDetectors] = useState([]);
  const [assignedDetectors, setAssignedDetectors] = useState([]);
  const [unassignedCircuits, setUnassignedCircuits] = useState([]);
  const [assignedCircuits, setAssignedCircuits] = useState([]);
  const [selectedDetectors, setSelectedDetectors] = useState([]);
  const [selectedAssignedDetectors, setSelectedAssignedDetectors] = useState(
    []
  );
  const [selectedCircuits, setSelectedCircuits] = useState([]);
  const [selectedAssignedCircuits, setSelectedAssignedCircuits] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const fetchDetectors = React.useCallback(async () => {
    if (!zone) return;

    setIsLoading(true);
    try {
      // Lấy danh sách tất cả detector
      const response = await handleAPI(apiEndpoint.detectors.getAllDetectors);
      if (response && response.data) {
        // Lọc ra những detector chưa được gán zone (zoneId null hoặc undefined)
        const unassigned = response.data.filter((detector) => !detector.zoneId);
        setUnassignedDetectors(unassigned);

        // Lọc ra những detector đã được gán vào zone hiện tại
        const assigned = response.data.filter(
          (detector) => detector.zoneId && detector.zoneId._id === zone._id
        );
        setAssignedDetectors(assigned);
      }
    } catch (error) {
      console.error("Error fetching detectors:", error);
      errorToast(error.message || "Không thể tải danh sách thiết bị");
    } finally {
      setIsLoading(false);
    }
  }, [zone]);

  const fetchCircuits = React.useCallback(async () => {
    if (!zone) return;

    try {
      // Lấy danh sách tất cả NAC circuits
      const response = await handleAPI(apiEndpoint.nacCircuits.getAll);
      if (response && response.data) {
        // Lọc ra những circuit chưa được gán zone (zoneId null hoặc undefined)
        const unassigned = response.data.filter((circuit) => !circuit.zoneId);
        setUnassignedCircuits(unassigned);

        // Lọc ra những circuit đã được gán vào zone hiện tại
        const assigned = response.data.filter(
          (circuit) => circuit.zoneId && circuit.zoneId._id === zone._id
        );
        setAssignedCircuits(assigned);
      }
    } catch (error) {
      console.error("Error fetching circuits:", error);
      errorToast(error.message || "Không thể tải danh sách mạch NAC");
    }
  }, [zone]);

  const fetchAllDevices = React.useCallback(async () => {
    if (!zone) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchDetectors(), fetchCircuits()]);
    } finally {
      setIsLoading(false);
    }
  }, [zone, fetchDetectors, fetchCircuits]);

  useEffect(() => {
    if (isOpen && zone) {
      fetchAllDevices();
    }
  }, [isOpen, zone, fetchAllDevices]);

  const getStatusTag = (status) => {
    switch (status) {
      case "Normal":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="text-[1.2rem]"
          >
            {t?.("common.normal") || "Bình thường"}
          </Tag>
        );
      case "Fault":
        return (
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="error"
            className="text-[1.2rem]"
          >
            {t?.("common.fault") || "Lỗi"}
          </Tag>
        );
      case "Disabled":
        return (
          <Tag
            icon={<StopOutlined />}
            color="default"
            className="text-[1.2rem]"
          >
            {t?.("common.disabled") || "Vô hiệu hóa"}
          </Tag>
        );
      default:
        return <Tag className="text-[1.2rem]">{status}</Tag>;
    }
  };
  const getDetectorTypeText = (type) => {
    switch (type) {
      case "Smoke":
        return "Khói";
      case "Heat":
        return "Nhiệt";
      case "Gas":
        return "Khí gas";
      default:
        return type;
    }
  };

  const getCircuitDeviceTypeText = (type) => {
    switch (type) {
      case "Horn":
        return t?.("NacManagement.deviceTypes.Horn") || "Còi báo";
      case "Strobe":
        return t?.("NacManagement.deviceTypes.Strobe") || "Đèn chớp";
      case "HornStrobe":
        return t?.("NacManagement.deviceTypes.HornStrobe") || "Còi + Đèn chớp";
      case "Audible":
        return t?.("NacManagement.deviceTypes.Audible") || "Âm thanh";
      case "Visual":
        return t?.("NacManagement.deviceTypes.Visual") || "Đèn báo động";
      case "Relay":
        return t?.("NacManagement.deviceTypes.Relay") || "Relay";
      case "Other":
        return t?.("NacManagement.deviceTypes.Other") || "Khác";
      default:
        return t?.("NacManagement.deviceTypes.undefined") || "Không xác định";
    }
  };
  const handleDetectorSelect = (detectorId, checked) => {
    if (checked) {
      setSelectedDetectors([...selectedDetectors, detectorId]);
    } else {
      setSelectedDetectors(selectedDetectors.filter((id) => id !== detectorId));
    }
  };

  const handleCircuitSelect = (circuitId, checked) => {
    if (checked) {
      setSelectedCircuits([...selectedCircuits, circuitId]);
    } else {
      setSelectedCircuits(selectedCircuits.filter((id) => id !== circuitId));
    }
  };

  const handleAssignedCircuitSelect = (circuitId, checked) => {
    if (checked) {
      setSelectedAssignedCircuits([...selectedAssignedCircuits, circuitId]);
    } else {
      setSelectedAssignedCircuits(
        selectedAssignedCircuits.filter((id) => id !== circuitId)
      );
    }
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDetectors(unassignedDetectors.map((d) => d._id));
    } else {
      setSelectedDetectors([]);
    }
  };

  const handleSelectAllCircuits = (checked) => {
    if (checked) {
      setSelectedCircuits(unassignedCircuits.map((c) => c._id));
    } else {
      setSelectedCircuits([]);
    }
  };
  const handleSelectAllAssigned = (checked) => {
    if (checked) {
      setSelectedAssignedDetectors(assignedDetectors.map((d) => d._id));
    } else {
      setSelectedAssignedDetectors([]);
    }
  };

  const handleAssignedDetectorSelect = (detectorId, checked) => {
    if (checked) {
      setSelectedAssignedDetectors([...selectedAssignedDetectors, detectorId]);
    } else {
      setSelectedAssignedDetectors(
        selectedAssignedDetectors.filter((id) => id !== detectorId)
      );
    }
  };

  const handleSelectAllAssignedCircuits = (checked) => {
    if (checked) {
      setSelectedAssignedCircuits(assignedCircuits.map((c) => c._id));
    } else {
      setSelectedAssignedCircuits([]);
    }
  };
  const handleAssignDevices = async () => {
    if (selectedDetectors.length === 0) {
      errorToast("Vui lòng chọn ít nhất một thiết bị để gán");
      return;
    }

    setIsAssigning(true);
    try {
      // Gán từng detector đã chọn vào zone
      const updatePromises = selectedDetectors.map((detectorId) =>
        handleAPI(
          apiEndpoint.detectors.updateDetector(detectorId),
          { zoneId: zone._id },
          "PUT"
        )
      );

      await Promise.all(updatePromises);

      successToast(
        `Đã gán ${selectedDetectors.length} thiết bị vào vùng "${zone.name}" thành công!`
      ); // Reset state
      setSelectedDetectors([]);

      // Refresh danh sách detectors
      await fetchDetectors();

      // Callback để parent component cập nhật nếu cần
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error assigning devices:", error);
      errorToast(error.message || "Có lỗi xảy ra khi gán thiết bị vào vùng");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignCircuits = async () => {
    if (selectedCircuits.length === 0) {
      errorToast("Vui lòng chọn ít nhất một mạch NAC để gán");
      return;
    }

    setIsAssigning(true);
    try {
      // Gán từng circuit đã chọn vào zone
      const updatePromises = selectedCircuits.map((circuitId) =>
        handleAPI(
          apiEndpoint.nacCircuits.update(circuitId),
          { zoneId: zone._id },
          "PUT"
        )
      );

      await Promise.all(updatePromises);

      successToast(
        `Đã gán ${selectedCircuits.length} mạch NAC vào vùng "${zone.name}" thành công!`
      );

      // Reset state
      setSelectedCircuits([]);

      // Refresh danh sách circuits
      await fetchCircuits();

      // Callback để parent component cập nhật nếu cần
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error assigning circuits:", error);
      errorToast(error.message || "Có lỗi xảy ra khi gán mạch NAC vào vùng");
    } finally {
      setIsAssigning(false);
    }
  };
  const handleUnassignDevices = async () => {
    if (selectedAssignedDetectors.length === 0) {
      errorToast("Vui lòng chọn ít nhất một thiết bị để bỏ gán");
      return;
    }

    setIsAssigning(true);
    try {
      // Bỏ gán từng detector đã chọn khỏi zone
      const updatePromises = selectedAssignedDetectors.map((detectorId) =>
        handleAPI(
          apiEndpoint.detectors.updateDetector(detectorId),
          { zoneId: null },
          "PUT"
        )
      );

      await Promise.all(updatePromises);

      successToast(
        `Đã bỏ gán ${selectedAssignedDetectors.length} thiết bị khỏi vùng "${zone.name}" thành công!`
      );

      // Reset state
      setSelectedAssignedDetectors([]);

      // Refresh danh sách detectors
      await fetchDetectors();

      // Callback để parent component cập nhật nếu cần
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error unassigning devices:", error);
      errorToast(error.message || "Có lỗi xảy ra khi bỏ gán thiết bị");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignCircuits = async () => {
    if (selectedAssignedCircuits.length === 0) {
      errorToast("Vui lòng chọn ít nhất một mạch NAC để bỏ gán");
      return;
    }

    setIsAssigning(true);
    try {
      // Bỏ gán từng circuit đã chọn khỏi zone
      const updatePromises = selectedAssignedCircuits.map((circuitId) =>
        handleAPI(
          apiEndpoint.nacCircuits.update(circuitId),
          { zoneId: null },
          "PUT"
        )
      );

      await Promise.all(updatePromises);

      successToast(
        `Đã bỏ gán ${selectedAssignedCircuits.length} mạch NAC khỏi vùng "${zone.name}" thành công!`
      );

      // Reset state
      setSelectedAssignedCircuits([]);

      // Refresh danh sách circuits
      await fetchCircuits();

      // Callback để parent component cập nhật nếu cần
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error unassigning circuits:", error);
      errorToast(error.message || "Có lỗi xảy ra khi bỏ gán mạch NAC");
    } finally {
      setIsAssigning(false);
    }
  };
  const handleModalClose = () => {
    setSelectedDetectors([]);
    setSelectedAssignedDetectors([]);
    setSelectedCircuits([]);
    setSelectedAssignedCircuits([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <LinkOutlined className="text-blue-500 text-2xl" />
          <span className="text-[2rem] font-bold text-gray-800">
            {t?.("ZonesManagement.assignDeviceTitle") ||
              "Gán thiết bị vào vùng"}
          </span>
        </div>
      }
      open={isOpen}
      onCancel={handleModalClose}
      width={800}
      centered
      destroyOnClose
      footer={null}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-[1.5rem] text-blue-800">
            <strong>
              {t?.("ZonesManagement.selectedZone") || "Vùng được chọn"}:
            </strong>{" "}
            {zone?.name}
          </p>
          {zone?.description && (
            <p className="text-[1.3rem] text-blue-600 mt-1">
              {zone.description}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Spin indicator={<LoadingOutlined spin size={24} />} />
            <p className="mt-2 text-gray-600">
              {t?.("common.loading") || "Đang tải..."}
            </p>
          </div>
        ) : (
          <Tabs
            defaultActiveKey="detectors"
            size="large"
            items={[
              {
                key: "detectors",
                label: (
                  <span className="flex items-center gap-2 text-[1.4rem]">
                    <ApiOutlined />
                    {t?.("ZonesManagement.detectors") || "Đầu báo"}
                    <Tag color="blue">
                      {assignedDetectors.length + unassignedDetectors.length}
                    </Tag>
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    {/* Detectors đã được gán */}
                    {assignedDetectors.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[1.6rem] font-semibold text-green-700">
                            {t?.("ZonesManagement.devicesAssignedToZone") ||
                              "Thiết bị đã được gán vào vùng này"}{" "}
                            ({assignedDetectors.length})
                          </h4>
                          <Checkbox
                            indeterminate={
                              selectedAssignedDetectors.length > 0 &&
                              selectedAssignedDetectors.length <
                                assignedDetectors.length
                            }
                            checked={
                              selectedAssignedDetectors.length ===
                                assignedDetectors.length &&
                              assignedDetectors.length > 0
                            }
                            onChange={(e) =>
                              handleSelectAllAssigned(e.target.checked)
                            }
                          >
                            {t?.("ZonesManagement.selectAll") || "Chọn tất cả"}
                          </Checkbox>
                        </div>

                        <List
                          dataSource={assignedDetectors}
                          renderItem={(detector) => (
                            <List.Item
                              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                                selectedAssignedDetectors.includes(detector._id)
                                  ? "bg-green-50 border-green-300"
                                  : "border-green-200"
                              }`}
                            >
                              <div className="flex items-center w-full">
                                <Checkbox
                                  checked={selectedAssignedDetectors.includes(
                                    detector._id
                                  )}
                                  onChange={(e) =>
                                    handleAssignedDetectorSelect(
                                      detector._id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-4"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <h5 className="text-[1.5rem] font-medium text-gray-800">
                                      {detector.name ||
                                        `Đầu báo ${detector.detector_address}`}
                                    </h5>
                                    {getStatusTag(detector.status)}
                                    <Tag
                                      color="green"
                                      className="text-[1.1rem]"
                                    >
                                      {t?.("ZonesManagement.assigned") ||
                                        "Đã gán"}
                                    </Tag>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[1.3rem] text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Địa chỉ:
                                      </span>{" "}
                                      {detector.detector_address}
                                    </div>
                                    <div>
                                      <span className="font-medium">Loại:</span>{" "}
                                      {getDetectorTypeText(
                                        detector.detector_type
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Bo mạch FALC:
                                      </span>{" "}
                                      {detector.falcBoardId?.name || "N/A"}
                                    </div>
                                    {detector.last_reading && (
                                      <div>
                                        <span className="font-medium">
                                          Giá trị cuối:
                                        </span>{" "}
                                        {detector.last_reading}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </List.Item>
                          )}
                          className="max-h-64 overflow-y-auto"
                        />

                        <div className="flex gap-2">
                          <Button
                            danger
                            loading={isAssigning}
                            disabled={selectedAssignedDetectors.length === 0}
                            onClick={handleUnassignDevices}
                            className="!border-red-500 !text-red-500 hover:!bg-red-50"
                          >
                            {t?.("ZonesManagement.unassignSelected") ||
                              "Bỏ gán đã chọn"}{" "}
                            ({selectedAssignedDetectors.length})
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Detectors chưa được gán */}
                    {unassignedDetectors.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[1.6rem] font-semibold text-gray-800">
                            {t?.("ZonesManagement.unassignedDevices") ||
                              "Thiết bị chưa được gán vùng"}{" "}
                            ({unassignedDetectors.length})
                          </h4>
                          <Checkbox
                            indeterminate={
                              selectedDetectors.length > 0 &&
                              selectedDetectors.length <
                                unassignedDetectors.length
                            }
                            checked={
                              selectedDetectors.length ===
                                unassignedDetectors.length &&
                              unassignedDetectors.length > 0
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          >
                            {t?.("ZonesManagement.selectAll") || "Chọn tất cả"}
                          </Checkbox>
                        </div>

                        <List
                          dataSource={unassignedDetectors}
                          renderItem={(detector) => (
                            <List.Item
                              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                                selectedDetectors.includes(detector._id)
                                  ? "bg-blue-50 border-blue-300"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center w-full">
                                <Checkbox
                                  checked={selectedDetectors.includes(
                                    detector._id
                                  )}
                                  onChange={(e) =>
                                    handleDetectorSelect(
                                      detector._id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-4"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <h5 className="text-[1.5rem] font-medium text-gray-800">
                                      {detector.name ||
                                        `Đầu báo ${detector.detector_address}`}
                                    </h5>
                                    {getStatusTag(detector.status)}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[1.3rem] text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Địa chỉ:
                                      </span>{" "}
                                      {detector.detector_address}
                                    </div>
                                    <div>
                                      <span className="font-medium">Loại:</span>{" "}
                                      {getDetectorTypeText(
                                        detector.detector_type
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Bo mạch FALC:
                                      </span>{" "}
                                      {detector.falcBoardId?.name || "N/A"}
                                    </div>
                                    {detector.last_reading && (
                                      <div>
                                        <span className="font-medium">
                                          Giá trị cuối:
                                        </span>{" "}
                                        {detector.last_reading}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </List.Item>
                          )}
                          className="max-h-64 overflow-y-auto"
                        />

                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            loading={isAssigning}
                            disabled={selectedDetectors.length === 0}
                            onClick={handleAssignDevices}
                            className="!bg-[#c62828] hover:!bg-[#a21818]"
                          >
                            {t?.("ZonesManagement.assignSelected") ||
                              "Gán đã chọn"}{" "}
                            ({selectedDetectors.length})
                          </Button>
                        </div>
                      </div>
                    ) : assignedDetectors.length === 0 ? (
                      <Empty
                        description={
                          <span className="text-[1.4rem]">
                            {t?.("ZonesManagement.noUnassignedDevices") ||
                              "Không có thiết bị nào chưa được gán vùng"}
                          </span>
                        }
                      />
                    ) : null}

                    {assignedDetectors.length === 0 &&
                      unassignedDetectors.length === 0 && (
                        <Empty
                          description={
                            <span className="text-[1.4rem]">
                              {t?.("ZonesManagement.noDevicesInSystem") ||
                                "Không có thiết bị nào trong hệ thống"}
                            </span>
                          }
                        />
                      )}
                  </div>
                ),
              },
              {
                key: "circuits",
                label: (
                  <span className="flex items-center gap-2 text-[1.4rem]">
                    <ThunderboltOutlined />
                    {t?.("ZonesManagement.nacCircuits") || "Mạch NAC"}
                    <Tag color="orange">
                      {assignedCircuits.length + unassignedCircuits.length}
                    </Tag>
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    {/* Circuits đã được gán */}
                    {assignedCircuits.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[1.6rem] font-semibold text-green-700">
                            {t?.("ZonesManagement.circuitsAssignedToZone") ||
                              "Mạch NAC đã được gán vào vùng này"}{" "}
                            ({assignedCircuits.length})
                          </h4>
                          <Checkbox
                            indeterminate={
                              selectedAssignedCircuits.length > 0 &&
                              selectedAssignedCircuits.length <
                                assignedCircuits.length
                            }
                            checked={
                              selectedAssignedCircuits.length ===
                                assignedCircuits.length &&
                              assignedCircuits.length > 0
                            }
                            onChange={(e) =>
                              handleSelectAllAssignedCircuits(e.target.checked)
                            }
                          >
                            {t?.("ZonesManagement.selectAll") || "Chọn tất cả"}
                          </Checkbox>
                        </div>

                        <List
                          dataSource={assignedCircuits}
                          renderItem={(circuit) => (
                            <List.Item
                              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                                selectedAssignedCircuits.includes(circuit._id)
                                  ? "bg-green-50 border-green-300"
                                  : "border-green-200"
                              }`}
                            >
                              <div className="flex items-center w-full">
                                <Checkbox
                                  checked={selectedAssignedCircuits.includes(
                                    circuit._id
                                  )}
                                  onChange={(e) =>
                                    handleAssignedCircuitSelect(
                                      circuit._id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-4"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <h5 className="text-[1.5rem] font-medium text-gray-800">
                                      {circuit.name ||
                                        `Mạch ${circuit.circuit_number}`}
                                    </h5>
                                    {getStatusTag(circuit.status)}
                                    <Tag
                                      color="green"
                                      className="text-[1.1rem]"
                                    >
                                      {t?.("ZonesManagement.assigned") ||
                                        "Đã gán"}
                                    </Tag>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[1.3rem] text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Số mạch:
                                      </span>{" "}
                                      {circuit.circuit_number}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Loại thiết bị:
                                      </span>{" "}
                                      {getCircuitDeviceTypeText(
                                        circuit.device_type
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Bảng NAC:
                                      </span>{" "}
                                      {circuit.nacBoardId?.name || "N/A"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Điện áp:
                                      </span>{" "}
                                      {circuit.voltage || "N/A"}V
                                    </div>
                                  </div>
                                  {circuit.description && (
                                    <div className="mt-2 text-[1.2rem] text-gray-500">
                                      {circuit.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </List.Item>
                          )}
                          className="max-h-64 overflow-y-auto"
                        />

                        <div className="flex gap-2">
                          <Button
                            danger
                            loading={isAssigning}
                            disabled={selectedAssignedCircuits.length === 0}
                            onClick={handleUnassignCircuits}
                            className="!border-red-500 !text-red-500 hover:!bg-red-50"
                          >
                            {t?.("ZonesManagement.unassignSelected") ||
                              "Bỏ gán đã chọn"}{" "}
                            ({selectedAssignedCircuits.length})
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Circuits chưa được gán */}
                    {unassignedCircuits.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[1.6rem] font-semibold text-gray-800">
                            {t?.("ZonesManagement.unassignedCircuits") ||
                              "Mạch NAC chưa được gán vùng"}{" "}
                            ({unassignedCircuits.length})
                          </h4>
                          <Checkbox
                            indeterminate={
                              selectedCircuits.length > 0 &&
                              selectedCircuits.length <
                                unassignedCircuits.length
                            }
                            checked={
                              selectedCircuits.length ===
                                unassignedCircuits.length &&
                              unassignedCircuits.length > 0
                            }
                            onChange={(e) =>
                              handleSelectAllCircuits(e.target.checked)
                            }
                          >
                            {t?.("ZonesManagement.selectAll") || "Chọn tất cả"}
                          </Checkbox>
                        </div>

                        <List
                          dataSource={unassignedCircuits}
                          renderItem={(circuit) => (
                            <List.Item
                              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                                selectedCircuits.includes(circuit._id)
                                  ? "bg-blue-50 border-blue-300"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center w-full">
                                <Checkbox
                                  checked={selectedCircuits.includes(
                                    circuit._id
                                  )}
                                  onChange={(e) =>
                                    handleCircuitSelect(
                                      circuit._id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-4"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-2">
                                    <h5 className="text-[1.5rem] font-medium text-gray-800">
                                      {circuit.name ||
                                        `Mạch ${circuit.circuit_number}`}
                                    </h5>
                                    {getStatusTag(circuit.status)}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[1.3rem] text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Số mạch:
                                      </span>{" "}
                                      {circuit.circuit_number}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Loại thiết bị:
                                      </span>{" "}
                                      {getCircuitDeviceTypeText(
                                        circuit.device_type
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Bảng NAC:
                                      </span>{" "}
                                      {circuit.nacBoardId?.name || "N/A"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Điện áp:
                                      </span>{" "}
                                      {circuit.voltage || "N/A"}V
                                    </div>
                                  </div>
                                  {circuit.description && (
                                    <div className="mt-2 text-[1.2rem] text-gray-500">
                                      {circuit.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </List.Item>
                          )}
                          className="max-h-64 overflow-y-auto"
                        />

                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            loading={isAssigning}
                            disabled={selectedCircuits.length === 0}
                            onClick={handleAssignCircuits}
                            className="!bg-[#c62828] hover:!bg-[#a21818]"
                          >
                            {t?.("ZonesManagement.assignSelected") ||
                              "Gán đã chọn"}{" "}
                            ({selectedCircuits.length})
                          </Button>
                        </div>
                      </div>
                    ) : assignedCircuits.length === 0 ? (
                      <Empty
                        description={
                          <span className="text-[1.4rem]">
                            {t?.("ZonesManagement.noUnassignedCircuits") ||
                              "Không có mạch NAC nào chưa được gán vùng"}
                          </span>
                        }
                      />
                    ) : null}

                    {assignedCircuits.length === 0 &&
                      unassignedCircuits.length === 0 && (
                        <Empty
                          description={
                            <span className="text-[1.4rem]">
                              {t?.("ZonesManagement.noCircuitsInSystem") ||
                                "Không có mạch NAC nào trong hệ thống"}
                            </span>
                          }
                        />
                      )}
                  </div>
                ),
              },
            ]}
          />
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleModalClose}>
            {t?.("common.cancel") || "Hủy"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignDeviceModal;
