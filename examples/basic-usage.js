// 导入请求管理器
const { createRequestManager } = require('bingwu-request-manager')

// 创建请求管理器实例
const requestManager = createRequestManager()

// 模拟API请求
function mockFetch(url, delay = 1000) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`请求 ${url} 完成`)
      resolve({ url, data: `来自 ${url} 的数据` })
    }, delay)
  })
}

// Promise方式使用示例
function loadDataWithPromise(id) {
  console.log(`开始加载数据: ${id}`)

  requestManager.managedRequest(
    // 异步请求函数
    (requestId) => {
      console.log(`发起请求 ${id}, 请求ID: ${requestId}`)
      return mockFetch(`/api/data/${id}`, Math.random() * 2000 + 500)
    },
    // 成功回调
    (data) => {
      console.log(`显示数据: ${JSON.stringify(data)}`)
    },
    // 过期请求回调
    (data, requestId) => {
      console.log(`丢弃过期数据, 请求ID: ${requestId}, 数据: ${JSON.stringify(data)}`)
    }
  )
}

// Async/Await方式使用示例
async function loadDataWithAsync(id) {
  console.log(`开始加载数据: ${id}`)

  try {
    const result = await requestManager.managedFetch(async (requestId) => {
      console.log(`发起请求 ${id}, 请求ID: ${requestId}`)
      return await mockFetch(`/api/data/${id}`, Math.random() * 2000 + 500)
    })

    if (result.isLatest) {
      console.log(`显示数据: ${JSON.stringify(result.data)}`)
    } else {
      console.log(`丢弃过期数据, 请求ID: ${result.requestId}, 数据: ${JSON.stringify(result.data)}`)
    }
  } catch (error) {
    console.error('请求错误:', error)
  }
}

// 手动控制模式示例
async function loadDataManually(id) {
  console.log(`开始加载数据: ${id}`)

  const { requestId, isLatestRequest } = requestManager.createRequest()

  try {
    console.log(`发起请求 ${id}, 请求ID: ${requestId}`)
    const data = await mockFetch(`/api/data/${id}`, Math.random() * 2000 + 500)

    if (isLatestRequest()) {
      console.log(`显示数据: ${JSON.stringify(data)}`)
    } else {
      console.log(`丢弃过期数据, 请求ID: ${requestId}, 数据: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    if (isLatestRequest()) {
      console.error('请求错误:', error)
    }
  }
}

// 示例：快速连续请求，模拟用户快速切换
function runDemo() {
  // Promise方式示例
  loadDataWithPromise('A')
  setTimeout(() => loadDataWithPromise('B'), 300)
  setTimeout(() => loadDataWithPromise('C'), 600)

  // 等待前面的示例完成
  setTimeout(() => {
    console.log('\n--- Async/Await 示例 ---\n')

    // Async/Await方式示例
    loadDataWithAsync('X')
    setTimeout(() => loadDataWithAsync('Y'), 300)
    setTimeout(() => loadDataWithAsync('Z'), 600)
  }, 4000)

  // 等待前面的示例完成
  setTimeout(() => {
    console.log('\n--- 手动控制模式示例 ---\n')

    // 手动控制模式示例
    loadDataManually('1')
    setTimeout(() => loadDataManually('2'), 300)
    setTimeout(() => loadDataManually('3'), 600)
  }, 8000)
}

// 运行示例
runDemo() 