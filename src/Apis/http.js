import fetch from '@system.fetch'
import request from '@system.request'
import setting from '../setting'
class Http {
    constructor() {
      this.apiRoot = setting.API_BASE_URL;
      this.headers = {};
    //   this.store = VUEX;
    //   this.updateTokenNum = 0;
      this.handleResponse = this.handleResponse.bind(this);
      this.removeToken = this.removeToken.bind(this);
      this.checkToken = this.checkToken.bind(this);
      // 暂存请求接口数据信息集合
      this.requestStores = {};
    }
  
    /**
     * 设置请求时携带的token
     * @param {string} token
     */
    setToken(token) {
      this.token = token;
    }
  
    /**
     * 清除token，返回登录页
     */
    removeToken() {
    //   const loginPath = `${process.env.VUE_APP_PATH_AI}${process.env.VUE_APP_BASE_URL}?logout=1`;
  
    //   // 清除用户权限
    //   sessionStorage.removeItem('ACCESS_PERM');
    //   localStorage.removeItem('vuex');
    //   util.store.remove('token');
    //   this.token = '';
    //   window.location.href = loginPath;
    }
  
    /**
     * 判断token是否过期
     */
    checkToken() {
    //   if (res.status === 401) {
    //     // 防止更新 Token 时清空数据
    //     if (!util.store.get('updateToken')) {
    //       this.removeToken();
    //     }
    //   }
    //   throw res;
    }
  
    /**
     * 设置每次请求时都需要携带的头部
     * @param {Object} header
    */
    setHeaders(headers) {
      this.headers = { ...this.headers, ...headers };
    }
  
    /**
     * get请求
     * @param {string} uri
     * @param {Object} [headers]
     */
    get(uri, headers) {
      return this.fetchWithoutBody('GET', uri, headers);
    }
  
    /**
     * delete请求
     * @param {string} uri
     * @param {Object} [headers]
     */
    delete(uri, headers) {
      return this.fetchWithoutBody('DELETE', uri, headers);
    }
  
    /**
     * post请求
     * @param {string} uri
     * @param {Object} body
     * @param {Object} [headers]
     */
    post(uri, body, headers) {
      return this.fetchWithBody('POST', uri, body, headers);
    }
  
    /**
     * patch请求
     * @param {string} uri
     * @param {Object} body
     * @param {Object} [headers]
     */
    patch(uri, body, headers) {
      return this.fetchWithBody('PATCH', uri, body, headers);
    }
  
    /**
     * put请求
     * @param {string} uri
     * @param {Object} body
     * @param {Object} [headers]
     */
    put(uri, body, headers) {
      return this.fetchWithBody('PUT', uri, body, headers);
    }
  
    /**
     * 下载文件请求
     * @param {String} uri
     * @param {Object} [headers]
     */
    getFile(uri, headers) {
      return request(this.getFullUri(uri), {
        method: 'GET',
        headers: {
          ...this.getCommonHeaders(),
          ...headers,
        },
      })
        .then((res) => {
          if (!res.ok) {
            return res.json()
              .then((data) => { throw data; });
          }
          return res;
        })
        .catch(this.checkToken);
    }
  
    /**
     * 带参数下载文件请求
     * @param {String} uri
     * @param {Object} body
     * @param {Object} [headers]
     */
    getFileWithBody(uri, body, headers) {
      // const isFormData = body instanceof FormData;
      // 暂存请求接口数据信息
      this.requestStores[uri] = {
        method: 'POST', uri, body, headers,
      };
      return request(this.getFullUri(uri), {
        method: 'POST',
        headers: {
          ...this.getCommonHeaders(),
          // ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...headers,
        },
        body
        // body: isFormData ? body : JSON.stringify(body),
      })
        .then(res => res)
        .catch(this.checkToken);
    }
  
    /**
     * post请求(更新Token)
     * @param {string} uri
     * @param {Object} body
     * @param {Object} [headers]
     */
    // tokenUpdate(uri, body, headers) {
    //   const isFormData = body instanceof FormData;
    //   return fetch(this.getFullUri(uri), {
    //     method: 'POST',
    //     headers: {
    //       ...this.getCommonHeaders(),
    //       ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    //       ...headers,
    //     },
    //     body: isFormData ? body : JSON.stringify(body),
    //   })
    //     .then(this.handleResponse)
    //     .catch(this.checkToken);
    // }
  
    /**
     * 不带body的请求
     * @param {string} method
     * @param {string} uri
     * @param {Object} [headers]
     */
    fetchWithoutBody(method, uri, headers) {
      // 暂存请求接口数据信息
      this.requestStores[uri] = {
        method, uri, headers,
      };
      return fetch(this.getFullUri(uri), {
        method,
        headers: {
          ...this.getCommonHeaders(),
          ...headers,
        },
      })
        .then(this.handleResponse)
        .catch(this.checkToken);
    }
  
    /**
     * 带body的请求
     * @param {string} method
     * @param {string} uri
     * @param {Object} body
     * @param {Object} [headers]
     */
    fetchWithBody(method, uri, body, headers) {
      // const isFormData = body instanceof FormData;
      // 暂存请求接口数据信息
      this.requestStores[uri] = {
        method, uri, body, headers,
      };
      return fetch(this.getFullUri(uri), {
        method,
        headers: {
          ...this.getCommonHeaders(),
          // ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...headers,
        },
        body
        // body: isFormData ? body : JSON.stringify(body),
      })
        .then(this.handleResponse)
        .catch(this.checkToken);
    }
  
    /**
     * 拼接完整的接口地址
     * @param {string} uri
     */
    getFullUri(uri) {
      return `${this.apiRoot}${uri}`;
    }
  
    /**
     * 获取通用headers
     */
    getCommonHeaders() {
      return {
        ...this.headers,
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      };
    }
  
    /**
     * 处理接口响应，对400/500类型的响应抛错
     * @param {Response} res
     */
    async handleResponse(res) {
      const result = res;
      // 获取当前请求接口数据在 this.requestStores 对象里的键值
      const KEY_URL = res.url.slice(res.url.indexOf(this.apiRoot) + this.apiRoot.length);
      if (result.ok) {
        delete this.requestStores[KEY_URL];
        return result.json()
          .catch(() => ({}));
      }
  
      return result.json()
        .then((data) => { throw data; });
    }
  }
export default new Http();