import * as SourceRepository from '@repositories/source.repository';
import { CreateSourceInput } from '@appTypes/source.types';

export const getSources = async (isActive?: boolean) => {
    return SourceRepository.findAll(isActive);
};

export const createSource = async (data: CreateSourceInput) => {
    return SourceRepository.create(data);
};
