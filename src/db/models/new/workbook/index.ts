import {Model} from '../../..';
import {Entry} from '../entry';

export const WorkbookModelColumn = {
    WorkbookId: 'workbookId',
    CollectionId: 'collectionId',
    Title: 'title',
    TitleLower: 'titleLower',
    Description: 'description',
    TenantId: 'tenantId',
    ProjectId: 'projectId',
    Meta: 'meta',
    CreatedBy: 'createdBy',
    CreatedAt: 'createdAt',
    UpdatedAt: 'updatedAt',
    UpdatedBy: 'updatedBy',
    DeletedAt: 'deletedAt',
    DeletedBy: 'deletedBy',
    IsTemplate: 'isTemplate',
    SortTitle: 'sortTitle',
} as const;

export class WorkbookModel extends Model {
    static get tableName() {
        return 'workbooks';
    }

    static get idColumn() {
        return WorkbookModelColumn.WorkbookId;
    }

    static get relationMappings() {
        return {
            entries: {
                relation: Model.HasManyRelation,
                modelClass: Entry,
                join: {
                    from: `${WorkbookModel.tableName}.${WorkbookModelColumn.WorkbookId}`,
                    to: `${Entry.tableName}.workbookId`,
                },
            },
        };
    }

    [WorkbookModelColumn.WorkbookId]!: string;
    [WorkbookModelColumn.CollectionId]!: Nullable<string>;
    [WorkbookModelColumn.Title]!: string;
    [WorkbookModelColumn.TitleLower]!: string;
    [WorkbookModelColumn.Description]!: Nullable<string>;
    [WorkbookModelColumn.TenantId]!: string;
    [WorkbookModelColumn.ProjectId]!: Nullable<string>;
    [WorkbookModelColumn.Meta]!: Record<string, unknown>;
    [WorkbookModelColumn.CreatedBy]!: string;
    [WorkbookModelColumn.CreatedAt]!: string;
    [WorkbookModelColumn.UpdatedBy]!: Nullable<string>;
    [WorkbookModelColumn.UpdatedAt]!: string;
    [WorkbookModelColumn.DeletedBy]!: Nullable<string>;
    [WorkbookModelColumn.DeletedAt]!: Nullable<string>;
    [WorkbookModelColumn.IsTemplate]!: boolean;
    [WorkbookModelColumn.SortTitle]!: string;

    entries?: Entry[];
}
