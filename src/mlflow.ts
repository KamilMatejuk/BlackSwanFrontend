export function mlflowRequest(path: string, method: string, payload?: Record<string, any>): Record<string, any> {
    const url = `${import.meta.env.VITE_MLFLOW_TRACKING_URI}/api/2.0/mlflow/${path}`
    const corsProxyUrl = `https://corsproxy.io/?${url}`
    return fetch(
        corsProxyUrl, {
        method: method,
        headers: { "Authorization": 'Basic ' +
            window.btoa(`${import.meta.env.VITE_MLFLOW_TRACKING_USERNAME}:${import.meta.env.VITE_MLFLOW_TRACKING_PASSWORD}`) },
        body: payload ? JSON.stringify(payload) : undefined
    })
    .then(async response => {
        const data = await response.json()
        if (response.status != 200) throw Error(data.error || data)
        return data
    })
    .then(data => {
        return { correct: true, ...data }
    }).catch((error: Error) => {
        return { correct: false, error: error.message }
    })
}

export function mlflowGet(path: string): Record<string, any> { return mlflowRequest(path, "GET") }
export function mlflowPost(path: string, payload: Record<string, any>): Record<string, any> { return mlflowRequest(path, "POST", payload) }
