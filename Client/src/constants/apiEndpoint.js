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
};
