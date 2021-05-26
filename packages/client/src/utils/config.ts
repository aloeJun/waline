import {
  defaultGravatarCDN,
  defaultLang,
  defaultUploadImage,
  getAvatar,
  getMeta,
  locales,
} from '../config';

import { decodePath, removeEndingSplash } from '.';
import { getEmojis, resolveOldEmojiMap } from './emoji';

import type { EmojiInfo, EmojiMaps, Locale, WalineOptions } from '../config';

export interface EmojiConfig {
  tabs: Pick<EmojiInfo, 'name' | 'icon' | 'items'>[];
  map: EmojiMaps;
}

export interface Config
  extends Required<
      Pick<
        WalineOptions,
        | 'el'
        | 'path'
        | 'lang'
        | 'meta'
        | 'pageSize'
        | 'requiredMeta'
        | 'uploadImage'
        | 'copyright'
        | 'login'
      >
    >,
    Pick<WalineOptions, 'dark' | 'serverURL' | 'visitor' | 'highlight'> {
  locale: Locale;
  wordLimit: [number, number] | false;
  emoji: Promise<EmojiConfig>;
  avatar: { cdn: string; param: string } | false;
}

export const getConfig = ({
  el = '#waline',
  serverURL,
  path = location.pathname,
  // TODO: remove
  placeholder,
  lang,
  // TODO: remove
  langMode,
  locale = langMode,
  wordLimit,
  emojiCDN,
  emojiMaps,
  emoji,
  avatar = 'mp',
  avatarCDN = defaultGravatarCDN,
  avatarForce,
  meta = ['nick', 'mail', 'link'],
  // TODO: remove
  requiredFields = [],
  requiredMeta = requiredFields,
  pageSize = 10,
  uploadImage,
  copyright = true,
  // TODO: remove
  anonymous,
  login = anonymous === true
    ? 'disable'
    : anonymous === false
    ? 'force'
    : 'enable',
  ...more
}: WalineOptions): Config => {
  const $lang = lang || defaultLang;
  const $locale = locales[$lang] || locales[defaultLang];

  // TODO: remove
  if (placeholder) $locale.placeholder = placeholder;

  return {
    el,
    // remove ending slash
    serverURL: removeEndingSplash(serverURL),
    path: decodePath(path),
    lang: $lang,
    locale: {
      ...$locale,
      ...(typeof locale === 'object' ? locale : {}),
    },
    emoji:
      // TODO: remove
      emojiCDN && typeof emojiMaps === 'object' && !emoji
        ? Promise.resolve(resolveOldEmojiMap(emojiMaps, emojiCDN))
        : getEmojis(
            emoji || ['https://cdn.jsdelivr.net/gh/walinejs/emojis/weibo']
          ),
    wordLimit: Array.isArray(wordLimit)
      ? wordLimit
      : wordLimit
      ? [0, wordLimit]
      : false,
    meta: getMeta(meta),
    requiredMeta: getMeta(requiredMeta),
    pageSize,
    avatar:
      avatar === 'hide'
        ? false
        : {
            cdn: avatarCDN,
            param: `?d=${getAvatar(avatar)}${
              avatarForce ? `&q=${Math.random().toString(32).substring(2)}` : ''
            }`,
          },
    uploadImage:
      typeof uploadImage === 'function' ? uploadImage : defaultUploadImage,
    copyright,
    login,
    ...more,
  };
};