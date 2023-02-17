import { request, download } from '@/modules/backend-client';
import { UbiquitousLanguage } from '@/modules/domain/ubiquitous-language-design';
import { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';
import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';

import { LanguageItem, LanguageScope } from './types';
import { LanguageModel } from './LanguageModel';

export interface LanguageProps {
  ready: boolean;
  id?: string | number;
  scope: LanguageScope;
}

/**
 * 统一语言
 */
export const Language = observer(function Language(props: LanguageProps) {
  const { id, scope, ready } = props;

  const model = useMemo(() => {
    return ready
      ? new LanguageModel({
          async fetcher() {
            const list = await request.requestByGet<LanguageItem[]>(
              '/wd/visual/web/universal-language/universal-language-page-query',
              {
                pageNo: 1,
                pageSize: 1000,
                languageType: scope,
                identity: id,
              }
            );

            return list.map(({ id, ...other }) => {
              return { ...other, id, uuid: id };
            });
          },
          async add(initialValue) {
            const newId = await request.requestByPost<string>(
              '/wd/visual/web/universal-language/universal-language-add',
              {
                ...initialValue,
                languageType: scope,
                identity: id,
              }
            );

            return { ...initialValue, id: newId, uuid: newId } as UbiquitousLanguageItem;
          },
          async remove(ids) {
            await request.requestByPost('/wd/visual/web/universal-language/universal-language-delete', { idList: ids });
          },
          async update(item) {
            await request.requestByPost('/wd/visual/web/universal-language/universal-language-update', { ...item });
          },
          async exportExcel() {
            return download({
              name: '/wd/visual/web/universal-language/universal-language-export',
              filename: '统一语言.xlsx',
              method: 'POST',
              body: {
                pageNo: 1,
                pageSize: 1000,
                languageType: scope,
                identity: id,
              },
            });
          },
          /**
           * excel 导入
           * @param param0
           */
          async importExcel({ file }) {
            const form = new FormData();
            form.append('file', file);
            form.append('identity', String(id));
            form.append('languageType', String(scope));

            await request.requestByPost('/wd/visual/web/universal-language/universal-language-import', form);
          },
        })
      : undefined;
  }, [id, ready, scope]);

  useEffect(() => {
    if (model) {
      model.initialize();
    }
  }, [model]);

  return model ? <UbiquitousLanguage model={model} /> : null;
});

export default Language;
