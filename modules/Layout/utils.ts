import Router from 'next/router';
import { LayoutMenu } from './types';

export function openMenu(menu: LayoutMenu) {
  if (menu.children?.length) {
    // 默认打开第一个
    Router.push(menu.children[0].route);
  } else {
    Router.push(menu.route);
  }
}
