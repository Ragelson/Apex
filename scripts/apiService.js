const API_BASE_URL = 'http://127.0.0.1:8080';

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

function getHeaders(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf;
    return headers;
}

async function handleResponse(res) {
    if (!res.ok) {
        const text = await res.text();
        console.warn(`[${res.status}] Error:`, text);
        throw new Error(text);
    }
    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json") ? res.json() : res.text();
}

function fetchWithTimeout(url, options, timeout = 10000) {
    return Promise.race([
        fetch(url, { ...options, credentials: 'include' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
    ]);
}

async function apiGet(path) {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        method: 'GET',
        headers: getHeaders()
    });
    return handleResponse(res);
}

async function apiPost(path, body) {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    return handleResponse(res);
}

async function apiPut(path, body) {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    return handleResponse(res);
}

async function apiDelete(path) {
    const res = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(res);
}

(async function initializeCsrfToken() {
    try {
        await fetch(`${API_BASE_URL}/v1/csrf`, {
            method: 'GET',
            credentials: 'include'
        });
    } catch (e) {
    }
})();
