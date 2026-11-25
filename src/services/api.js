const BASE_URL = (
    import.meta.env.VITE_API_URL || "/api/v1"
).replace(/\/+$/, "");

export async function api(path, method = "GET", body) {

    const token = sessionStorage.getItem("token");

    let response;

    try {

        response = await fetch(`${BASE_URL}${path}`, {
            method,

            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",

                ...(token
                    ? { Authorization: `Bearer ${token}` }
                    : {}),
            },

            ...(body !== undefined
                ? { body: JSON.stringify(body) }
                : {}),
        });

    } catch {

        throw new Error(
            "Unable to connect to server. Please check your connection."
        );

    }

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {

        const errors = {
            400: "Invalid request.",
            401: "Invalid credentials or session expired.",
            403: "You do not have permission.",
            404: "Requested resource not found.",
            409: "Conflict with existing data.",
            429: "Too many requests.",
            500: "Internal server error.",
            503: "Server temporarily unavailable.",
        };

        throw new Error(
            data?.message ||
            errors[response.status] ||
            `Request failed (${response.status})`
        );

    }

    return data;
}