// Sử dụng keys cho i18n thay vì text cứng
const settingsMenuKeys = [
    {
        titleKey: "settings.falc",
        url: "/cai-dat/falc",
    },
    {
        titleKey: "settings.nac",
        url: "/cai-dat/nac",
    },
    {
        titleKey: "settings.zone",
        url: "/cai-dat/quan-ly-phan-vung",
    },
    {
        titleKey: "settings.timer",
        url: "/cai-dat/hen-gio",
    },
    {
        titleKey: "settings.account",
        url: "/cai-dat/quan-ly-tai-khoan",
    },
    {
        titleKey: "settings.ip",
        url: "/cai-dat/doi-ip",
    },
    {
        titleKey: "settings.cabinet",
        url: "/cai-dat/tu-trung-tam",
    },
    {
        titleKey: "settings.simulation",
        url: "/cai-dat/mo-phong-su-co",
    },
    {
        titleKey: "settings.reports",
        url: "/cai-dat/bao-cao-phan-tich",
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
    "settings.ip": "🌐",
    "settings.cabinet": "🔌",
    "settings.simulation": "⚠️",
    "settings.reports": "📊",
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
