import React, { useEffect, useState } from "react";
import {
    LeftCircleFilled,
    LoadingOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { errorToast } from "../../../utils/toastConfig";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import handleAPI from "../../../api/handleAPI";
import AddTimerModal from "./AddTimerModal";
import EditTimerModal from "./EditTimerModal";
import DeleteTimerModal from "./DeleteTimerModal";
import { Spin, Switch } from "antd";

function TimeManagement({ t }) {
    const [timers, setTimers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false); // State cho modal xóa timer
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [timerToDelete, setTimerToDelete] = useState(null);

    // State cho modal chỉnh sửa timer
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [timerToEdit, setTimerToEdit] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch timers and panels data
                const timersResponse = await handleAPI(
                    apiEndpoint.times.getAllTimes
                );

                if (timersResponse && timersResponse.data) {
                    setTimers(timersResponse.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                errorToast(error.message || "Không thể tải dữ liệu");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddTimer = () => {
        setAddModalVisible(true);
    };

    const onAddSuccess = (newTimer) => {
        setTimers([...timers, newTimer]);
    };

    // Map days to Vietnamese abbreviations
    const dayMapping = {
        monday: "T2",
        tuesday: "T3",
        wednesday: "T4",
        thursday: "T5",
        friday: "T6",
        saturday: "T7",
        sunday: "CN",
    };

    const allDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const handleToggleEnabled = async (timerId, currentState) => {
        try {
            const response = await handleAPI(
                apiEndpoint.times.toggleTime(timerId),
                null,
                "PATCH"
            );

            if (response && response.success) {
                setTimers(
                    timers.map((timer) =>
                        timer._id === timerId
                            ? { ...timer, isEnabled: !currentState }
                            : timer
                    )
                );
            }
        } catch (error) {
            console.error("Error updating timer:", error);
            errorToast("Không thể cập nhật trạng thái timer");
        }
    };
    const handleEditTimer = (timer) => {
        setTimerToEdit(timer);
        setEditModalVisible(true);
    };

    const handleDeleteTimer = (timer) => {
        setTimerToDelete(timer);
        setDeleteModalVisible(true);
    };
    const handleDeleteModalClose = () => {
        setDeleteModalVisible(false);
        setTimerToDelete(null);
    };

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setTimerToEdit(null);
    };

    const onEditSuccess = (updatedTimer) => {
        setTimers(
            timers.map((timer) =>
                timer._id === updatedTimer._id ? updatedTimer : timer
            )
        );
    };

    const onDeleteSuccess = (timerId) => {
        setTimers(timers.filter((timer) => timer._id !== timerId));
    };

    return (
        <div className="p-4 lg:p-[5rem]">
            <div>
                <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <div className="flex items-center gap-4 md:mb-0 mb-4">
                        <Link to="/cai-dat">
                            <LeftCircleFilled className="text-[2.5rem] text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">
                            {t("TimerManagement.title")}
                        </h1>
                    </div>

                    <button
                        onClick={handleAddTimer}
                        className="flex gap-2 items-center justify-center bg-gradient-to-r from-[#c62828] to-[#8f0202] text-white px-4 py-2 rounded-md hover:from-[#d32f2f] hover:to-[#9a0007] hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300"
                    >
                        <PlusOutlined />
                        {t("TimerManagement.add")}
                    </button>
                </div>
                {/* Danh sách hẹn giờ */}
                {/* Timer List */}
                {isLoading ? (
                    <div className="text-white text-center py-8">
                        <Spin indicator={<LoadingOutlined spin />} />
                        {t("TimerManagement.loading")}
                    </div>
                ) : (
                    <div className="bg-[#434343] p-6 rounded-xl text-white shadow-lg border border-white/10">
                        {" "}
                        {timers.length > 0 ? (
                            <div className="space-y-4">
                                {timers.map((timer) => (
                                    <div
                                        key={timer._id}
                                        className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-xl shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300"
                                    >
                                        {" "}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
                                            {/* Cột 1: Switch, Name và Time */}
                                            <div className="flex flex-col space-y-4">
                                                <div className="flex gap-4 items-center">
                                                    <Switch
                                                        checked={
                                                            timer.isEnabled
                                                        }
                                                        onChange={() =>
                                                            handleToggleEnabled(
                                                                timer._id,
                                                                timer.isEnabled
                                                            )
                                                        }
                                                        size="default"
                                                        className="bg-[#00000073] transition-colors duration-300"
                                                    />
                                                    <div className="flex justify-center md:justify-end">
                                                        <div
                                                            className={`px-4 py-2 rounded-full text-[1.2rem] font-medium ${
                                                                timer.isEnabled
                                                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                                                    : "bg-gray-500/20 text-gray-400 border border-gray-500/50"
                                                            }`}
                                                        >
                                                            {timer.isEnabled
                                                                ? t(
                                                                      "TimerManagement.active"
                                                                  )
                                                                : t(
                                                                      "TimerManagement.inactive"
                                                                  )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <h3 className=" text-[1.6rem] font-bold text-white break-words">
                                                    {timer.name}
                                                </h3>
                                                <div className="text-[2.8rem] text-green-400 font-bold">
                                                    {new Date(
                                                        timer.time
                                                    ).toLocaleTimeString(
                                                        "vi-VN",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </div>
                                                {timer.description && (
                                                    <p className="text-sm text-gray-300 break-words">
                                                        {timer.description}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Cột 2: Days và Audio */}
                                            <div className="flex flex-col gap-8">
                                                {/* Audio */}
                                                <div className="bg-black/20 p-3 rounded-lg">
                                                    <audio
                                                        controls
                                                        className="w-full h-8"
                                                        style={{
                                                            filter: "invert(1)",
                                                        }}
                                                        preload="none"
                                                    >
                                                        <source
                                                            src={
                                                                timer.audioFile
                                                            }
                                                            type="audio/mpeg"
                                                        />
                                                        <source
                                                            src={
                                                                timer.audioFile
                                                            }
                                                            type="audio/wav"
                                                        />
                                                        <source
                                                            src={
                                                                timer.audioFile
                                                            }
                                                            type="audio/ogg"
                                                        />
                                                        Audio không được hỗ trợ
                                                    </audio>
                                                </div>{" "}
                                                {/* Days */}
                                                <div className="flex flex-wrap gap-1">
                                                    {allDays.map((day) => {
                                                        const isActive =
                                                            timer.repeat
                                                                .length === 0 ||
                                                            timer.repeat.includes(
                                                                day
                                                            );
                                                        return (
                                                            <div
                                                                key={day}
                                                                className={`w-[3.2rem] h-[2.2rem] rounded-full flex items-center justify-center text-[1.2rem] font-bold ${
                                                                    isActive
                                                                        ? "bg-green-500 text-white shadow-lg"
                                                                        : "bg-gray-600 text-gray-400"
                                                                }`}
                                                            >
                                                                {
                                                                    dayMapping[
                                                                        day
                                                                    ]
                                                                }
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* Cột 3: Hành động */}{" "}
                                            <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                                <button
                                                    onClick={() =>
                                                        handleEditTimer(timer)
                                                    }
                                                    className="min-w-[88px] flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-blue-900/20 w-full md:w-auto"
                                                >
                                                    <EditOutlined />
                                                    <span>
                                                        {t("common.edit")}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteTimer(timer)
                                                    }
                                                    className="min-w-[88px] flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 shadow-lg hover:shadow-red-900/20 w-full md:w-auto"
                                                >
                                                    <DeleteOutlined />
                                                    <span>
                                                        {" "}
                                                        {t("common.delete")}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ClockCircleOutlined className="text-6xl text-gray-500 mb-4" />
                                <div className="text-gray-400 text-[1.8rem]">
                                    {t("TimerManagement.nodata")}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <AddTimerModal
                t={t}
                isOpen={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSuccess={onAddSuccess}
            />
            {timerToEdit && (
                <EditTimerModal
                    t={t}
                    timer={timerToEdit}
                    isOpen={editModalVisible}
                    onClose={handleEditModalClose}
                    onSuccess={onEditSuccess}
                />
            )}
            {timerToDelete && (
                <DeleteTimerModal
                    t={t}
                    timerId={timerToDelete._id}
                    timer={timerToDelete}
                    isOpen={deleteModalVisible}
                    onClose={handleDeleteModalClose}
                    onSuccess={onDeleteSuccess}
                />
            )}
        </div>
    );
}

export default TimeManagement;
