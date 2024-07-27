function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      ),
    },
  };
}

let nextUnitWork = null;
function workLoop(deadline) {
  // 应该退出
  let shouldYield = false;
  // 有工作单元且不应该退出
  while (nextUnitWork && !shouldYield) {
    // 执行一个工作单元并且返回一个新的工作单元
    nextUnitWork = performUnitOfWork(nextUnitWork);
    // 查看剩余的时间是否足够执行下一个工作单元
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 没有足够的工作时间就退出循环并把控制权交还给浏览器，请求浏览器下一次空闲的时候执行我们的工作单元
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function performUnitOfWork(work) {}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export default createElement;
