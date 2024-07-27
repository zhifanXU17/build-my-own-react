function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== 'children';
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  return dom;
}
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 发出第一个 Fiber：Root Fiber
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    sibling: null,
    child: null,
    parent: null,
  };

  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
  // 应该退出
  let shouldYield = false;
  // 有工作单元且不应该退出
  while (nextUnitOfWork && !shouldYield) {
    // 执行一个工作单元并且返回一个新的工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 查看剩余的时间是否足够执行下一个工作单元
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  // 没有足够的工作时间就退出循环并把控制权交还给浏览器，请求浏览器下一次空闲的时候执行我们的工作单元
  requestIdleCallback(workLoop);
}

// 第一次请求
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // 创建 DOM 元素
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 追加到父节点
  // if (fiber.parent) {
  //   fiber.parent.dom.append(fiber.dom);
  // }

  // 给 children 新建 fiber
  const elements = fiber.props.children;
  let prevSibling = null;
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
      child: null,
      sibling: null,
    };

    // fiber 的一堆 fiber 儿子里面，只有第一个 fiber 是亲儿子，其他都算是第一个亲儿子的兄弟，这样可以节省时间，不用返回去寻找父 fiber,直接就可把同为兄弟的 fiber 结算完
    // https://cdn.prod.website-files.com/5d2dd7e1b4a76d8b803ac1aa/5f6b3409f5628c49d6136dee_React%20Fiber%20relationship.jpeg
    // 详细情况可以看上面这张图
    // 第一步直接往最深处去找，直到找到最深处的 Fiber Tree 没有儿子的那个节点，也就是 LA
    // 第二步就是找他的兄弟 LB，LB 也没有兄弟或者儿子节点就返回到父亲 L 节点
    // 第三步就是 L 的兄弟 S 节点，如此往复
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }

  // 返回下一个 Fiber
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    } else {
      nextFiber = nextFiber.parent;
    }
  }
}

export default render;
