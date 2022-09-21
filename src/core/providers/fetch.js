export function fetcher(url, data) {
    let fetchUrl = url
    if (data) {
      let paramsArr = []
      Object.keys(data).forEach(key => paramsArr.push(key + '=' + data[key]))
      fetchUrl += '?' + paramsArr.join('&')
    }
    return fetch(fetchUrl)
      .then(res => res && {data: res.json()})
  }
  
  export function poster(url, data, options = {}) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(res => res && {data: res.json()})
  }
export const axios = {
    get: fetcher,
    post: poster
}

export default {
    create (params) {
        const {
            baseURL,
            timeout,
            headers,
            auth
        } = params
        this.baseURL = baseURL
        this.timeout = timeout
        this.headers = headers
        this.auth = auth
        return this
    },
    request ({ data, params, url, method }) {
        const uri = this.baseURL + '/' + url
        if (method === 'get') {
            return fetcher(uri, params)
        } else {
            
            return poster(uri, data)
        }
    }
}