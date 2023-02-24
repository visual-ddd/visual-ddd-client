import { FormValidatorContext } from '@/lib/editor';
import { ActivityBindingType, ActivityDSL } from '../../dsl';
import { ScenarioEditorModel } from '../../model';

function getDslFromContext(context: FormValidatorContext) {
  return context.model.node.properties as unknown as ActivityDSL;
}

function getScenarioEditorModelFromContext(context: FormValidatorContext) {
  return context.editorModel as ScenarioEditorModel;
}

export function checkServiceId(value: string | undefined, context: FormValidatorContext) {
  const dsl = getDslFromContext(context);
  const editorModel = getScenarioEditorModelFromContext(context);

  if (!value) {
    return;
  }

  // 非业务场景服务绑定不需要校验
  if (dsl.binding?.type !== ActivityBindingType.ScenarioService) {
    return;
  }

  if (!editorModel.serviceStore.getObjectById(value)) {
    throw new Error(`业务场景服务不存在`);
  }
}

async function isDomainIdExists(id: string, model: ScenarioEditorModel) {
  return (await model.domainServiceStore.getDomains()).some(domain => domain.id === id);
}

export async function checkDomainId(value: string | undefined, context: FormValidatorContext) {
  const dsl = getDslFromContext(context);
  const editorModel = getScenarioEditorModelFromContext(context);

  if (!value) {
    return;
  }

  // 非领域服务绑定不需要校验
  if (dsl.binding?.type !== ActivityBindingType.DomainService) {
    return;
  }

  if (!(await isDomainIdExists(value, editorModel))) {
    throw new Error(`业务域不存在`);
  }
}

async function isVersionIdExists(domainId: string, id: string, model: ScenarioEditorModel) {
  return (await model.domainServiceStore.getDomainVersionList(domainId)).some(version => version.id === id);
}

export async function checkVersionId(value: string | undefined, context: FormValidatorContext) {
  const dsl = getDslFromContext(context);
  const editorModel = getScenarioEditorModelFromContext(context);

  if (!value) {
    return;
  }

  // 非领域服务绑定不需要校验
  if (dsl.binding?.type !== ActivityBindingType.DomainService) {
    return;
  }

  if (!dsl.binding.domainId) {
    return;
  }

  if (!(await isDomainIdExists(dsl.binding.domainId, editorModel))) {
    return;
  }

  if (!(await isVersionIdExists(dsl.binding.domainId, value, editorModel))) {
    throw new Error(`业务域服务版本不存在`);
  }
}

async function isDomainServiceIdExists(domainId: string, versionId: string, id: string, model: ScenarioEditorModel) {
  return (await model.domainServiceStore.getDomainServiceList(domainId, versionId)).some(service => service.id === id);
}

export async function checkDomainServiceId(value: string | undefined, context: FormValidatorContext) {
  const dsl = getDslFromContext(context);
  const editorModel = getScenarioEditorModelFromContext(context);

  if (!value) {
    return;
  }

  // 非领域服务绑定不需要校验
  if (dsl.binding?.type !== ActivityBindingType.DomainService) {
    return;
  }

  if (!dsl.binding.domainId || !dsl.binding.versionId) {
    return;
  }

  if (!(await isDomainIdExists(dsl.binding.domainId, editorModel))) {
    return;
  }

  if (!(await isVersionIdExists(dsl.binding.domainId, dsl.binding.versionId, editorModel))) {
    return;
  }

  if (!(await isDomainServiceIdExists(dsl.binding.domainId, dsl.binding.versionId, value, editorModel))) {
    throw new Error(`业务域服务不存在`);
  }
}
