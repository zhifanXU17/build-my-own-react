import { createElement, render } from './micro-react';

const element = createElement(
  'h1',
  { id: 'title', style: 'background:blue' },
  'Hello World',
  createElement(
    'a',
    {
      href: 'https://www.bilibili.com',
      style: 'background: red',
    },
    'bilibili'
  )
);

const container = document.getElementById('root');

render(element, container);

console.log(element);
