function getNotificationStyle(type) {

    switch (type) {

        case "comment":
            return {
                color: "primary",
                icon: "fa-solid fa-comment",
                background: "#43b9b230"
            };

        case "newsletter":
            return {
                color: "success",
                icon: "fa-solid fa-envelope",
                background: "#17a60030"
            };

        case "contact":
            return {
                color: "warning",
                icon: "fa-solid fa-address-book",
                background: "#f0ad4e30"
            };

        case "blog-published":
            return {
                color: "info",
                icon: "fa-solid fa-newspaper",
                background: "#2e8dd330"
            };

        default:
            return {
                color: "secondary",
                icon: "fa-solid fa-bell",
                background: "#17a60030"
            };
    }
}

module.exports = getNotificationStyle;