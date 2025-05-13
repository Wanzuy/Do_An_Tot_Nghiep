import React, { useState } from "react";
import {
    CaretDownOutlined,
    CaretRightOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";

const ZoneItem = ({ t, zone, level = 0, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = zone.children && zone.children.length > 0;

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const handleAction = (e) => {
        if (e.key === "edit") {
            onEdit(zone);
        } else if (e.key === "delete") {
            onDelete(zone);
        }
    };

    const menuItems = [
        {
            key: "edit",
            label: t("common.edit"),
            icon: <EditOutlined />,
        },
        {
            key: "delete",
            label: t("common.delete"),
            icon: <DeleteOutlined />,
            danger: true,
        },
    ];

    return (
        <div>
            <div
                className="flex items-center p-2 hover:bg-gray-700/30 rounded-lg transition-all"
                style={{ paddingLeft: `${level * 24 + 12}px` }}
            >
                {hasChildren ? (
                    <span
                        className="mr-2 cursor-pointer p-1"
                        onClick={toggleExpanded}
                    >
                        {expanded ? (
                            <CaretDownOutlined />
                        ) : (
                            <CaretRightOutlined />
                        )}
                    </span>
                ) : (
                    <span className="mr-2 w-[16px]"></span> // Khoảng trống để căn chỉnh
                )}

                <span className="flex flex-grow items-center truncate whitespace-nowrap overflow-hidden text-[1.6rem]">
                    <strong className="text-[1.8rem] mr-1 shrink-0">
                        {t("ZonesManagement.zone")}
                    </strong>
                    <span className="truncate">{zone.name}</span>
                </span>

                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: handleAction,
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <button className="text-gray-300 hover:text-white p-2">
                        <MoreOutlined />
                    </button>
                </Dropdown>
            </div>

            {hasChildren && expanded && (
                <div className="zone-children">
                    {zone.children.map((child) => (
                        <ZoneItem
                            key={child._id}
                            zone={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            t={t}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ZoneTree = ({ t, zones, onEdit, onDelete }) => {
    return (
        <div className="zone-tree">
            {zones.map((zone) => (
                <ZoneItem
                    key={zone._id}
                    zone={zone}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    t={t}
                />
            ))}
        </div>
    );
};

export default ZoneTree;
