# Bingwu Request Manager

一个轻量级的请求管理器，用于解决网络请求竞态问题。

## demo

- demo源代码：https://github.com/BINGWU2003/bing-wu-demo/blob/main/src/views/bingwu-request-manager/BasicView.vue
- 演示地址：https://bing-wu-demo.netlify.app/#/bingwu-request-manager/basic

## 背景

在前端应用中，特别是在快速切换页面、选项卡或频繁搜索的场景下，很容易出现请求竞态问题，即后发出的请求先返回，而先发出的请求后返回，导致界面显示错误的数据。

`bingwu-request-manager` 提供了一种简单且高效的解决方案，通过为每个请求分配唯一标识符，只处理最新请求的响应，保证数据一致性。

## 安装

```bash
# npm
npm install bingwu-request-manager

# yarn
yarn add bingwu-request-manager

# pnpm
pnpm add bingwu-request-manager
```

## 使用方法

### 基本用法

```javascript
import { createRequestManager } from 'bingwu-request-manager';

// 创建请求管理器
const requestManager = createRequestManager();
```

### 使用 Promise 方式

```javascript
function fetchUserData(userId) {
  requestManager.managedRequest(
    // 异步请求函数
    (requestId) => {
      console.log(`开始获取用户数据，请求ID: ${requestId}`);
      return fetch(`/api/users/${userId}`)
        .then(response => response.json());
    },
    // 成功回调（只处理最新请求）
    (data) => {
      console.log('显示用户数据:', data);
      renderUserProfile(data);
    },
    // 过期请求回调（可选）
    (data, requestId) => {
      console.log(`丢弃过期的用户数据，请求ID: ${requestId}`);
    }
  );
}
```

### 使用 Async/Await 方式

```javascript
async function loadUserData(userId) {
  try {
    // 显示加载状态
    showLoading();

    // 使用managedFetch进行请求
    const result = await requestManager.managedFetch(async (requestId) => {
      console.log(`开始获取用户数据，请求ID: ${requestId}`);
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    });

    // 检查是否是最新请求的结果
    if (result.isLatest) {
      // 处理数据并更新UI
      console.log('显示用户数据:', result.data);
      renderUserProfile(result.data);
    } else {
      console.log(`丢弃过期的用户数据，请求ID: ${result.requestId}`);
    }
  } catch (error) {
    // 错误处理
    console.error('加载用户数据失败:', error);
    showError('加载用户数据失败');
  } finally {
    // 清除加载状态
    hideLoading();
  }
}
```

### 手动控制模式

```javascript
async function searchProducts(keyword) {
  // 创建请求并获取检查函数
  const { requestId, isLatestRequest } = requestManager.createRequest();

  // 显示加载状态
  showLoading();

  try {
    // 发起请求
    const response = await fetch(`/api/search?q=${keyword}`);
    const data = await response.json();

    // 检查这是否是最新请求
    if (isLatestRequest()) {
      // 处理并显示搜索结果
      renderSearchResults(data);
    } else {
      console.log(`丢弃过期的搜索结果，请求ID: ${requestId}`);
    }
  } catch (error) {
    if (isLatestRequest()) {
      console.error('搜索失败:', error);
      showError('搜索失败');
    }
  } finally {
    if (isLatestRequest()) {
      hideLoading();
    }
  }
}
```

## API 文档

### createRequestManager()

创建一个请求管理器实例。

```javascript
const requestManager = createRequestManager();
```

### requestManager.createRequest()

创建一个新的请求，并返回请求ID和检查函数。

```javascript
const { requestId, isLatestRequest } = requestManager.createRequest();
```

返回:
- `requestId`: 唯一的请求ID
- `isLatestRequest`: 一个函数，调用时返回该请求是否是最新请求

### requestManager.managedRequest(asyncFn, onSuccess, onOutdated)

执行一个受控的异步请求，只处理最新请求的响应。

```javascript
requestManager.managedRequest(
  asyncFn,    // 异步请求函数，接收requestId参数
  onSuccess,  // 成功回调，仅当是最新请求时调用
  onOutdated  // 可选的过期请求回调
);
```

- `asyncFn`: 一个接收requestId并返回Promise的函数
- `onSuccess`: 可选，处理成功响应的回调，仅当请求是最新请求时调用
- `onOutdated`: 可选，处理过期请求响应的回调

### requestManager.managedFetch(fetchFn)

使用async/await方式处理请求竞态。

```javascript
const result = await requestManager.managedFetch(fetchFn);
```

- `fetchFn`: 一个接收requestId并返回Promise的异步函数
- 返回: 包含data, requestId, isLatest属性的对象

### requestManager.getCurrentId()

获取当前最新的请求ID。

```javascript
const currentId = requestManager.getCurrentId();
```

## 兼容性

- 现代浏览器
- Node.js 12+

## 许可证

MIT 