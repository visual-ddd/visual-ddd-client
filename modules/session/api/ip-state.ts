const states: Map<string, [string, number][]> = new Map();

const TTL = 1000 * 60 * 3; // 3 分钟
const MAX_LENGTH = 3; // 最多 3 个 ip

export function getState(id: string) {
  return states.get(id);
}

export function isExceed(id: string) {
  const state = getState(id);
  if (state == null) {
    return false;
  }

  return state.length >= MAX_LENGTH;
}

export function updateState(id: string, ip: string) {
  const now = Date.now();
  const state = states.get(id);

  if (state == null) {
    states.set(id, [[ip, now]]);
  } else {
    // 删除掉过期的 ip
    for (const i of state.slice(0)) {
      if (now - i[1] > TTL) {
        state.splice(state.indexOf(i), 1);
      }
    }

    // 如果超过最大长度，不再添加, 避免溢出
    if (state.length > MAX_LENGTH) {
      return;
    }

    const index = state.findIndex(([i]) => i === ip);

    if (index !== -1) {
      state[index][1] = now;
    } else {
      state.push([ip, now]);
    }
  }
}

/**
 * 移除 ip
 * @param req
 */
export function removeState(id: string, ip: string) {
  if (id && ip) {
    const state = states.get(id);
    if (state && state.length) {
      const index = state.findIndex(([i]) => i === ip);

      if (index !== -1) {
        state.splice(index, 1);
      }
    }
  }
}
