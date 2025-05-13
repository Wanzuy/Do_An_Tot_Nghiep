import React from "react";

const RobotLogo = () => {
    const mainColor = "#c62828";
    const lightColor = "#ffffff";

    return (
        <svg
            viewBox="0 0 200 200"
            width="100%"
            height="auto"
            style={{ maxWidth: "300px" }}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* Thân robot - hình chữ nhật đơn giản */}
            <rect
                x="50"
                y="70"
                width="100"
                height="90"
                rx="5"
                ry="5"
                fill={mainColor}
            />

            {/* Đầu robot */}
            <rect
                x="65"
                y="40"
                width="70"
                height="50"
                rx="5"
                ry="5"
                fill={mainColor}
            />

            {/* Ăng-ten */}
            <circle cx="100" cy="35" r="5" fill={lightColor} />
            <line
                x1="100"
                y1="35"
                x2="100"
                y2="40"
                stroke={lightColor}
                strokeWidth="3"
            />

            {/* Mắt robot */}
            <circle cx="80" cy="60" r="6" fill={lightColor} />
            <circle cx="120" cy="60" r="6" fill={lightColor} />

            {/* Miệng robot */}
            <rect x="85" y="75" width="30" height="3" fill={lightColor} />

            {/* Nút điều khiển */}
            <circle cx="85" cy="100" r="5" fill={lightColor} />
            <circle cx="100" cy="100" r="5" fill={lightColor} />
            <circle cx="115" cy="100" r="5" fill={lightColor} />

            {/* Tay robot */}
            <rect
                x="30"
                y="80"
                width="20"
                height="40"
                rx="5"
                ry="5"
                fill={mainColor}
            />
            <rect
                x="150"
                y="80"
                width="20"
                height="40"
                rx="5"
                ry="5"
                fill={mainColor}
            />

            {/* Chân robot */}
            <rect
                x="65"
                y="160"
                width="20"
                height="25"
                rx="3"
                ry="3"
                fill={mainColor}
            />
            <rect
                x="115"
                y="160"
                width="20"
                height="25"
                rx="3"
                ry="3"
                fill={mainColor}
            />

            {/* Mã lỗi 404 */}
            <text
                x="100"
                y="145"
                fontFamily="Arial, sans-serif"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
                fill={lightColor}
            >
                404
            </text>
        </svg>
    );
};

export default RobotLogo;
