export const apiEndpoint = {
    auth: {
        login: "/auth/login",
        getAccount: "/auth",
        deleteAccount: (userId) => `/auth/${userId}`,
        createAccount: "/auth",
        updateAccount: (userId) => `/auth/${userId}`,
    },
    zones: {
        getAllZones: "/zones",
        addZone: "/zones",
        updateZone: (zoneId) => `/zones/${zoneId}`,
        deleteZone: (zoneId) => `/zones/${zoneId}`,
    },
    times: {
        getAllTimes: "/times",
        addTime: "/times",
        getTimeById: (timeId) => `/times/${timeId}`,
        toggleTime: (timeId) => `/times/${timeId}`,
        updateTime: (timeId) => `/times/${timeId}`,
        deleteTime: (timeId) => `/times/${timeId}`,
    },
    panels: {
        getAllPanels: "/panels",
        getPanelsById: (panelId) => `/panels/${panelId}`,
        updatePanel: (panelId) => `/panels/${panelId}`,
    },
    volumes: {
        getVolumeByPanel: (panelId) => `/volumes/panel/${panelId}`,
        createVolume: "/volumes",
        updateVolume: (volumeId) => `/volumes/${volumeId}`,
        testVolume: (volumeId) => `/volumes/${volumeId}/test`,
    },
    falc: {
        getAll: "/falcboards",
        updateStatus: (falcId) => `/falcboards/${falcId}/status`,
    },
    chatbot: {
        chat: "/api/chatbot/chat",
        suggestions: "/api/chatbot/suggestions",
        history: "/api/chatbot/history",
        clearHistory: "/api/chatbot/history",
    },
};
