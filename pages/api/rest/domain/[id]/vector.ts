import { allowMethod } from '@/lib/api';
import { handleGetVector } from '@/modules/domain/api';

export default allowMethod('GET', handleGetVector);
