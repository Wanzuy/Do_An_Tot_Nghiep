import React, { useEffect, useState } from "react";
import {
    LeftCircleFilled,
    LoadingOutlined,
    CloseOutlined,
    SoundOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Spin, Slider, Button, Card, Alert } from "antd";
import { errorToast, successToast } from "../../../utils/toastConfig";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import handleAPI from "../../../api/handleAPI";

function VolumnManagement({ t }) {
    const [selectedPanel, setSelectedPanel] = useState(null);
    const [currentVolume, setCurrentVolume] = useState(50);
    const [originalVolume, setOriginalVolume] = useState(50);
    const [volumeId, setVolumeId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio instance ref
    const audioRef = React.useRef(null);

    // Fetch panels on component mount and auto-select the largest panel
    useEffect(() => {
        const fetchPanelsAndSelectLargest = async () => {
            setIsLoading(true);
            try {
                const response = await handleAPI(
                    apiEndpoint.panels.getAllPanels
                );
                if (response && response.data && response.data.length > 0) {
                    // Find the largest panel (assuming "Control Panel" is larger than "Sub Panel")
                    // or you can use other criteria like panel size, name, etc.
                    const largestPanel =
                        response.data.find(
                            (panel) => panel.panel_type === "Control Panel"
                        ) || response.data[0]; // fallback to first panel if no Control Panel found

                    setSelectedPanel(largestPanel);
                    await fetchVolumeByPanel(largestPanel._id);
                }
            } catch (error) {
                console.error("Error fetching panels:", error);
                errorToast(
                    error.message ||
                        t?.("VolumeManagement.loadError") ||
                        "Không thể tải dữ liệu âm lượng"
                );
            } finally {
                setIsLoading(false);
            }
        };
        fetchPanelsAndSelectLargest();
    }, [t]);

    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Fetch volume setting for selected panel
    const fetchVolumeByPanel = async (panelId) => {
        setIsLoading(true);
        try {
            const response = await handleAPI(
                apiEndpoint.volumes.getVolumeByPanel(panelId)
            );
            if (response && response.data) {
                const volume = response.data;
                setCurrentVolume(volume.level);
                setOriginalVolume(volume.level);
                setVolumeId(volume._id);
            }
        } catch (error) {
            console.log("Error fetching volume:", error);
            setCurrentVolume(50);
            setOriginalVolume(50);
            setVolumeId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVolumeChange = (value) => {
        setCurrentVolume(value);
    };

    const handleCancel = () => {
        setCurrentVolume(originalVolume);
    };

    const handleSave = async () => {
        if (!selectedPanel) {
            errorToast("Không thể lưu cài đặt âm lượng");
            return;
        }

        setIsSaving(true);
        try {
            let response;

            if (volumeId) {
                // Update existing volume setting
                response = await handleAPI(
                    apiEndpoint.volumes.updateVolume(volumeId),
                    { level: currentVolume },
                    "PUT"
                );
            } else {
                // Create new volume setting
                response = await handleAPI(
                    apiEndpoint.volumes.createVolume,
                    { panelId: selectedPanel._id, level: currentVolume },
                    "POST"
                );
                if (response && response.data) {
                    setVolumeId(response.data._id);
                }
            }

            if (response && response.success) {
                setOriginalVolume(currentVolume);
                successToast("Lưu cài đặt âm lượng thành công");
            }
        } catch (error) {
            console.error("Error saving volume:", error);
            errorToast(error.message || "Lỗi khi lưu cài đặt âm lượng");
        } finally {
            setIsSaving(false);
        }
    }; // Handle test audio playback
    const handleTestAudio = () => {
        const audioUrl =
            "https://nhacchuong123.com/nhac-chuong/nhac-doc/Nhac Chuong Bao Thuc Trong Quan Doi.mp3";

        if (isPlaying) {
            // Stop current audio if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            return;
        }

        // Start playing audio
        setIsPlaying(true);

        // Create or reuse audio element
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
        } else {
            audioRef.current.src = audioUrl;
            audioRef.current.currentTime = 0;
        }

        // Set volume based on current volume setting (convert percentage to 0-1 range)
        audioRef.current.volume = currentVolume / 100;

        // Set up event listeners before playing
        audioRef.current.onended = () => {
            setIsPlaying(false);
        };

        audioRef.current.onerror = () => {
            console.error("Audio loading error");
            errorToast(
                t?.("VolumeManagement.audioError") ||
                    "Không thể tải âm thanh test"
            );
            setIsPlaying(false);
        };

        // Play audio
        audioRef.current
            .play()
            .then(() => {
                console.log("Audio playing successfully");
            })
            .catch((error) => {
                console.error("Error playing audio:", error);
                errorToast(
                    t?.("VolumeManagement.audioError") ||
                        "Không thể phát âm thanh test"
                );
                setIsPlaying(false);
            });
    };

    const hasChanges = currentVolume !== originalVolume;

    // Slider marks
    const marks = {
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
    };

    return (
        <div className="p-4 lg:p-[5rem]">
            <div>
                {/* Header */}
                <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <div className="flex items-center gap-4 md:mb-0 mb-4">
                        <Link to="/cai-dat">
                            <LeftCircleFilled className="text-[2.5rem] text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">
                            {t("VolumeManagement.title") ||
                                "Điều chỉnh âm lượng"}
                        </h1>
                    </div>
                </div>

                {/* Main Content */}
                {isLoading && !selectedPanel ? (
                    <div className="text-white text-center py-8">
                        <Spin indicator={<LoadingOutlined spin />} />
                        <p className="mt-4"> {t("common.loading")}</p>
                    </div>
                ) : (
                    <div className="bg-[#434343] p-6 rounded-xl text-white shadow-lg border border-white/10">
                        <div className="space-y-6">
                            {/* Volume Control */}
                            {selectedPanel && (
                                <div className="space-y-6">
                                    {/* Volume Slider */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[1.8rem] font-semibold text-white">
                                                {t("VolumeManagement.content")}
                                            </label>
                                            <div className="text-[2.4rem] font-bold text-green-500">
                                                {currentVolume}%
                                            </div>
                                        </div>

                                        <div className="px-4">
                                            <Slider
                                                min={0}
                                                max={100}
                                                marks={marks}
                                                step={1}
                                                value={currentVolume}
                                                onChange={handleVolumeChange}
                                                className="volume-slider"
                                                tooltip={{
                                                    formatter: (value) =>
                                                        `${value}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Status Alert */}
                                    {hasChanges && (
                                        <Alert
                                            message={t(
                                                "VolumeManagement.changealert"
                                            )}
                                            description={t(
                                                "VolumeManagement.changealertdesc"
                                            )}
                                            type="warning"
                                            showIcon
                                            className="bg-orange-100 border-orange-300"
                                        />
                                    )}

                                    {/* Action Buttons */}
                                    <div className="!mt-20 flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            icon={<CloseOutlined />}
                                            onClick={handleCancel}
                                            disabled={!hasChanges}
                                            size="large"
                                            className="flex-1 max-w-[200px] !bg-gray-600 hover:!bg-gray-700 !text-white border-none"
                                        >
                                            {t("common.cancel")}
                                        </Button>{" "}
                                        <Button
                                            icon={<SoundOutlined />}
                                            onClick={handleTestAudio}
                                            disabled={!volumeId}
                                            size="large"
                                            className={`flex-1 max-w-[200px] border-none !text-white ${
                                                isPlaying
                                                    ? "!bg-red-600 hover:!bg-red-700"
                                                    : "!bg-green-600 hover:!bg-green-700"
                                            }`}
                                        >
                                            {isPlaying
                                                ? t("VolumeManagement.stop") ||
                                                  "Dừng âm thanh"
                                                : t("VolumeManagement.test") ||
                                                  "Test âm thanh"}
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            onClick={handleSave}
                                            loading={isSaving}
                                            disabled={!hasChanges}
                                            size="large"
                                            className="flex-1 max-w-[200px] !bg-red-500 hover:!bg-red-600 !text-white border-none"
                                        >
                                            {t("common.save")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>{" "}
            <style jsx>{`
                .volume-slider .ant-slider-track {
                    background: linear-gradient(
                        to right,
                        #22c55e,
                        #16a34a,
                        #15803d
                    );
                }
                .volume-slider .ant-slider-handle {
                    border-color: #22c55e;
                    background-color: #ffffff;
                }
                .volume-slider .ant-slider-handle:hover {
                    border-color: #15803d;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
                }
                .volume-slider .ant-slider-handle:focus {
                    border-color: #15803d;
                    box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.3);
                }
                .volume-slider .ant-slider-dot-active {
                    border-color: #22c55e;
                    background-color: #22c55e;
                }
                .volume-slider .ant-slider-mark-text {
                    color: #9ca3af;
                    font-weight: 500;
                }
                .volume-slider .ant-slider-mark-text-active {
                    color: #22c55e;
                    font-weight: 600;
                }
                .volume-slider .ant-slider-rail {
                    background-color: #374151;
                }
            `}</style>
        </div>
    );
}

export default VolumnManagement;
