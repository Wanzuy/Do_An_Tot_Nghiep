import React, { useEffect, useState } from "react";
import {
    FileTextOutlined,
    LeftCircleFilled,
    LoadingOutlined,
    PlusOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import { Spin } from "antd";
import DeleteUserModal from "./DeleteUserModal";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";

function AccountManagement({ t }) {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);

    // State cho modal thêm
    const [addModalVisible, setAddModalVisible] = useState(false);

    // State cho modal sửa
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // State cho modal xóa
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        getAccount();
    }, []);

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setUserToEdit(null); // Đặt lại userToEdit khi đóng modal
    };

    // Callback khi thêm thành công
    const onAddSuccess = (newUser) => {
        // Cập nhật danh sách người dùng bằng cách thêm người dùng mới
        setUsers([...users, newUser]);
    };

    const onEditSuccess = (updatedUser) => {
        setUsers(
            users.map((user) =>
                user._id === updatedUser._id
                    ? { ...user, ...updatedUser }
                    : user
            )
        );
    };

    // Callback khi xóa thành công
    const onDeleteSuccess = (deletedId) => {
        // Cập nhật danh sách người dùng bằng cách loại bỏ người dùng đã xóa
        setUsers(users.filter((user) => user._id !== deletedId));
    };

    const getAccount = async () => {
        setIsLoading(true);
        try {
            const response = await handleAPI(apiEndpoint.auth.getAccount);
            if (response && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRolePermissions = (role) => {
        const permissions = [
            { name: t("AccountManagement.falc"), status: "disabled" },
            { name: t("AccountManagement.nac"), status: "disabled" },
            { name: t("AccountManagement.zone"), status: "disabled" },
            { name: t("AccountManagement.timer"), status: "disabled" },
            { name: t("AccountManagement.volume"), status: "disabled" },
            { name: t("AccountManagement.account"), status: "disabled" },
            { name: t("AccountManagement.ip"), status: "disabled" },
            { name: t("AccountManagement.cabinet"), status: "disabled" },
            {
                name: t("AccountManagement.simulation"),
                status: "disabled",
            },
            {
                name: t("AccountManagement.reports"),
                status: "disabled",
            },
        ];

        if (role === 1) {
            // Admin có tất cả các quyền
            permissions.forEach((permission) => {
                permission.status = "enabled";
            });
        } else if (role === 2) {
            // vận hành hệ thống
            permissions[0].status = "enabled";
            permissions[1].status = "enabled";
            permissions[2].status = "enabled";
            permissions[3].status = "enabled";
            permissions[4].status = "enabled";
            permissions[6].status = "enabled";
            permissions[7].status = "enabled";
            permissions[8].status = "enabled";
        } else if (role === 3) {
            // Kỹ thuật viên bảo trì
            permissions[9].status = "enabled";
        }

        return permissions;
    };

    const getRoleName = (roleValue) => {
        switch (Number(roleValue)) {
            case 1:
                return t("AccountManagement.admin");
            case 2:
                return t("AccountManagement.operate");
            case 3:
                return t("AccountManagement.Technician");
            default:
                return "N/A";
        }
    };

    const renderPermissionStatus = (status) => {
        if (status === "enabled") {
            return (
                <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span>
            );
        } else {
            return (
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2"></span>
            );
        }
    };

    return (
        <div className="p-4 lg:p-[5rem]">
            <div>
                <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <div className="flex items-center gap-4 md:mb-0 mb-4">
                        <Link to="/cai-dat">
                            <LeftCircleFilled className="text-[2.5rem] text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white ">
                            {t("AccountManagement.title")}
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            setAddModalVisible(true);
                        }}
                        className="flex gap-2 items-center justify-center bg-gradient-to-r from-[#c62828] to-[#8f0202] text-white px-4 py-2 rounded-md hover:from-[#d32f2f] hover:to-[#9a0007] hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300"
                    >
                        <PlusOutlined />
                        {t("AccountManagement.add")}
                    </button>
                </div>

                {/* Danh sách tài khoản */}
                {isLoading ? (
                    <div className="text-white text-center py-8">
                        <Spin indicator={<LoadingOutlined spin />} /> Đang tải
                        dữ liệu...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {users.map((user, index) => {
                            const permissions = getRolePermissions(user.role);
                            return (
                                <div
                                    key={user._id || index}
                                    className="bg-[#434343] p-6 md:px-10 rounded-xl text-white shadow-lg transition hover:shadow-xl border border-white/10"
                                >
                                    {/* Header của thẻ người dùng */}
                                    <div className=" flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <UserOutlined />
                                            <span className="font-medium">
                                                {user.showname}
                                            </span>
                                        </div>

                                        <div className="md:flex items-center gap-2 hidden">
                                            <FileTextOutlined />
                                            <span className="italic">
                                                {getRoleName(user.role)}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <button
                                                onClick={() => {
                                                    setUserToEdit(user._id);
                                                    setEditModalVisible(true);
                                                }}
                                                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 mr-2"
                                            >
                                                {t("common.edit")}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserToDelete(user._id);
                                                    setDeleteModalVisible(true);
                                                }}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                            >
                                                {t("common.delete")}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Danh sách quyền */}
                                    {permissions.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                                            {permissions.map(
                                                (permission, permIndex) => (
                                                    <div
                                                        key={permIndex}
                                                        className="flex items-center gap-1 bg-gray-500 rounded-lg px-3 py-2 text-[1.2rem] md:text-[1.6rem] lg:text-[1.8rem] text-white"
                                                    >
                                                        {renderPermissionStatus(
                                                            permission.status
                                                        )}
                                                        <span>
                                                            {permission.name}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {userToDelete && (
                <DeleteUserModal
                    t={t}
                    userId={userToDelete}
                    isOpen={deleteModalVisible}
                    onClose={() => setDeleteModalVisible(false)}
                    onSuccess={onDeleteSuccess}
                />
            )}

            {/* Modal thêm người dùng */}
            <AddUserModal
                t={t}
                isOpen={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSuccess={onAddSuccess}
            />

            {userToEdit && (
                <EditUserModal
                    t={t}
                    userId={userToEdit}
                    isOpen={editModalVisible}
                    onClose={handleEditModalClose}
                    onSuccess={onEditSuccess}
                    users={users}
                />
            )}
        </div>
    );
}

export default AccountManagement;
