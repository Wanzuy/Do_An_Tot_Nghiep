// Sử dụng keys cho i18n thay vì text cứng
const settingsMenuKeys = [
    {
        titleKey: "settings.falc",
        url: "/cai-dat/khoi-giam-sat-dau-bao-falc",
    },
    {
        titleKey: "settings.nac",
        url: "/cai-dat/khoi-dieu-khien-chuong-den-nac",
    },
    {
        titleKey: "settings.zone",
        url: "/cai-dat/quan-ly-phan-vung",
    },
    {
        titleKey: "settings.timer",
        url: "/cai-dat/quan-ly-dong-ho-hen-gio",
    },
    {
        titleKey: "settings.volume",
        url: "/cai-dat/dieu-chinh-am-luong",
    },
    {
        titleKey: "settings.account",
        url: "/cai-dat/quan-ly-tai-khoan",
    },
    {
        titleKey: "settings.cabinet",
        url: "/cai-dat/tu-trung-tam-tu-dia-chi",
    },
    {
        titleKey: "settings.problem",
        url: "/cai-dat/quan-ly-su-co",
    },
];

// Ánh xạ icon theo key
const menuIconKeys = {
    "settings.falc": "🔥",
    "settings.nac": "🔔",
    "settings.zone": "🏢",
    "settings.timer": "⏱️",
    "settings.volume": "🔊",
    "settings.account": "👤",
    "settings.cabinet": "🔌",
    "settings.problem": "⚠️",
};

export const getSettingsMenu = (t) => {
    return settingsMenuKeys.map((item) => ({
        title: t(item.titleKey),
        titleKey: item.titleKey,
        url: item.url,
    }));
};

// Tạo hàm trả về icon dựa trên key đã dịch
export const getMenuIcon = (titleKey) => {
    return menuIconKeys[titleKey] || "⚙️";
};

export { settingsMenuKeys, menuIconKeys };
