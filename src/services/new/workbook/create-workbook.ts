import {AppError} from '@gravity-ui/nodekit';
import {checkWorkbookByTitle} from './check-workbook-by-title';
import {getParentIds} from '../collection/utils/get-parents';
import {ServiceArgs} from '../types';
import {getPrimary} from '../utils';
import {makeSchemaValidator} from '../../../components/validation-schema-compiler';
import {transaction} from 'objection';
import {US_ERRORS} from '../../../const';
import {WorkbookModel, WorkbookModelColumn} from '../../../db/models/new/workbook';
import Utils, {logInfo} from '../../../utils';
import {registry} from '../../../registry';

const validateArgs = makeSchemaValidator({
    type: 'object',
    required: ['collectionId', 'title'],
    properties: {
        collectionId: {
            type: ['string', 'null'],
        },
        title: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
    },
});

export interface CreateWorkbookArgs {
    collectionId: Nullable<string>;
    title: string;
    description?: string;
}

export const createWorkbook = async (
    {ctx, trx, skipValidation = false, skipCheckPermissions = false}: ServiceArgs,
    args: CreateWorkbookArgs,
) => {
    const {title, description, collectionId} = args;

    logInfo(ctx, 'CREATE_WORKBOOK_START', {
        title,
        description,
        collectionId: collectionId ? Utils.encodeId(collectionId) : null,
    });

    if (!skipValidation) {
        validateArgs(args);
    }

    const {accessServiceEnabled, accessBindingsServiceEnabled} = ctx.config;

    const {
        user: {userId},
        tenantId,
        projectId,
        isPrivateRoute,
    } = ctx.get('info');

    const targetTrx = getPrimary(trx);

    let parentIds: string[] = [];

    if (collectionId !== null) {
        parentIds = await getParentIds({
            ctx,
            trx: targetTrx,
            collectionId,
        });

        if (parentIds.length === 0) {
            throw new AppError(`Cannot find parent collection with id – ${collectionId}`, {
                code: US_ERRORS.COLLECTION_NOT_EXISTS,
            });
        }
    }

    const checkWorkbookByTitleResult = await checkWorkbookByTitle(
        {
            ctx,
            trx: targetTrx,
            skipValidation: true,
            skipCheckPermissions: skipCheckPermissions || accessBindingsServiceEnabled,
        },
        {
            title,
            collectionId,
        },
    );

    if (checkWorkbookByTitleResult === true) {
        throw new AppError(`Workbook with title "${title}" already exists in this scope`, {
            code: US_ERRORS.WORKBOOK_ALREADY_EXISTS,
        });
    }

    let operation: any;

    const result = await transaction(targetTrx, async (transactionTrx) => {
        logInfo(ctx, 'CREATE_WORKBOOK_IN_DB_START');

        const model = await WorkbookModel.query(transactionTrx)
            .insert({
                [WorkbookModelColumn.Title]: title,
                [WorkbookModelColumn.TitleLower]: title.toLowerCase(),
                [WorkbookModelColumn.Description]: description ?? null,
                [WorkbookModelColumn.TenantId]: tenantId,
                [WorkbookModelColumn.ProjectId]: projectId,
                [WorkbookModelColumn.CollectionId]: collectionId,
                [WorkbookModelColumn.CreatedBy]: userId,
                [WorkbookModelColumn.UpdatedBy]: userId,
            })
            .returning('*')
            .timeout(WorkbookModel.DEFAULT_QUERY_TIMEOUT);

        logInfo(ctx, 'CREATE_WORKBOOK_IN_DB_FINISH', {
            workbookId: Utils.encodeId(model.workbookId),
        });

        const {Workbook} = registry.common.classes.get();

        const workbook = new Workbook({
            ctx,
            model,
        });

        if (accessServiceEnabled && accessBindingsServiceEnabled && !isPrivateRoute) {
            operation = await workbook.register({
                parentIds,
            });
        }

        return workbook;
    });

    logInfo(ctx, 'CREATE_WORKBOOK_FINISH', {
        workbookId: Utils.encodeId(result.model.workbookId),
    });

    return {
        workbook: result,
        operation,
    };
};
