/**
 * Mock Database Engine — In-memory Prisma-compatible client.
 * Behaves like PostgreSQL via Prisma ORM with full CRUD, relations, filtering, and raw SQL support.
 * Activate with USE_MOCK_DB=true in .env
 */

import { SEED_DATA, TABLE_NAME_MAP, COLUMN_SCHEMAS } from './mock-data';

// ─── Types ───────────────────────────────────────────────────────────────────

type ModelName = keyof typeof SCHEMAS;
type SortDir = 'asc' | 'desc';

interface RelationDef {
    type: 'one' | 'many';
    model: ModelName;
    foreignKey?: string;  // 'many': FK on the related model
    localKey?: string;    // 'one': FK on this model → related.id
}

interface ModelSchema {
    primaryKey: string;
    uniqueFields: string[];
    relations: Record<string, RelationDef>;
    defaults?: Record<string, any>;
    autoTimestamps?: boolean;
}

// ─── Schema Definitions ──────────────────────────────────────────────────────

const SCHEMAS: Record<string, ModelSchema> = {
    user: {
        primaryKey: 'id',
        uniqueFields: ['email'],
        autoTimestamps: true,
        defaults: { role: 'user', status: 'Active' },
        relations: {
            invoices: { type: 'many', model: 'invoice', foreignKey: 'userId' },
            brands: { type: 'many', model: 'userBrand', foreignKey: 'userId' },
            igExtractions: { type: 'many', model: 'igExtraction', foreignKey: 'userId' },
            ttExtractions: { type: 'many', model: 'ttExtraction', foreignKey: 'userId' },
        },
    },
    userBrand: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: false,
        defaults: { role: 'member' },
        relations: {
            user: { type: 'one', localKey: 'userId', model: 'user' },
            brand: { type: 'one', localKey: 'brandId', model: 'brand' },
        },
    },
    brand: {
        primaryKey: 'id',
        uniqueFields: ['slug'],
        autoTimestamps: true,
        defaults: { status: 'Active', defaultCurrency: 'USD', brandFontColor: '#000000' },
        relations: {
            campaigns: { type: 'many', model: 'campaign', foreignKey: 'brandId' },
            integrations: { type: 'many', model: 'integration', foreignKey: 'brandId' },
            metrics: { type: 'many', model: 'metric', foreignKey: 'brandId' },
            shareLinks: { type: 'many', model: 'shareLink', foreignKey: 'brandId' },
            users: { type: 'many', model: 'userBrand', foreignKey: 'brandId' },
            industryRelation: { type: 'one', localKey: 'industryId', model: 'industry' },
            subTypeRelation: { type: 'one', localKey: 'industrySubTypeId', model: 'industrySubType' },
        },
    },
    industry: {
        primaryKey: 'id',
        uniqueFields: ['name', 'slug'],
        autoTimestamps: false,
        relations: {
            brands: { type: 'many', model: 'brand', foreignKey: 'industryId' },
            subTypes: { type: 'many', model: 'industrySubType', foreignKey: 'industryId' },
        },
    },
    industrySubType: {
        primaryKey: 'id',
        uniqueFields: ['slug'],
        autoTimestamps: false,
        relations: {
            brands: { type: 'many', model: 'brand', foreignKey: 'industrySubTypeId' },
            industry: { type: 'one', localKey: 'industryId', model: 'industry' },
        },
    },
    campaign: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: true,
        defaults: { status: 'Active', budgetPlanned: 0, timezone: 'UTC' },
        relations: {
            brand: { type: 'one', localKey: 'brandId', model: 'brand' },
            channels: { type: 'many', model: 'campaignChannel', foreignKey: 'campaignId' },
            metrics: { type: 'many', model: 'metric', foreignKey: 'campaignId' },
            subCampaigns: { type: 'many', model: 'subCampaign', foreignKey: 'campaignId' },
        },
    },
    subCampaign: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: true,
        defaults: { status: 'Active', budgetPlanned: 0 },
        relations: {
            campaign: { type: 'one', localKey: 'campaignId', model: 'campaign' },
            channels: { type: 'many', model: 'subCampaignChannel', foreignKey: 'subCampaignId' },
            metrics: { type: 'many', model: 'metric', foreignKey: 'subCampaignId' },
        },
    },
    platform: {
        primaryKey: 'id',
        uniqueFields: ['slug'],
        autoTimestamps: false,
        relations: {
            channels: { type: 'many', model: 'channel', foreignKey: 'platformId' },
        },
    },
    channel: {
        primaryKey: 'id',
        uniqueFields: ['slug'],
        autoTimestamps: false,
        defaults: { status: 'Active' },
        relations: {
            platform: { type: 'one', localKey: 'platformId', model: 'platform' },
            campaigns: { type: 'many', model: 'campaignChannel', foreignKey: 'channelId' },
            metrics: { type: 'many', model: 'metric', foreignKey: 'channelId' },
            subCampaigns: { type: 'many', model: 'subCampaignChannel', foreignKey: 'channelId' },
        },
    },
    campaignChannel: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: false,
        relations: {
            channel: { type: 'one', localKey: 'channelId', model: 'channel' },
            campaign: { type: 'one', localKey: 'campaignId', model: 'campaign' },
        },
    },
    subCampaignChannel: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: false,
        relations: {
            channel: { type: 'one', localKey: 'channelId', model: 'channel' },
            subCampaign: { type: 'one', localKey: 'subCampaignId', model: 'subCampaign' },
        },
    },
    integration: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: true,
        defaults: { status: 'Active' },
        relations: {
            brand: { type: 'one', localKey: 'brandId', model: 'brand' },
        },
    },
    metric: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: true,
        defaults: { impressions: 0, spend: 0, clicks: 0, reach: 0, engagement: 0, currency: 'USD' },
        relations: {
            brand: { type: 'one', localKey: 'brandId', model: 'brand' },
            campaign: { type: 'one', localKey: 'campaignId', model: 'campaign' },
            subCampaign: { type: 'one', localKey: 'subCampaignId', model: 'subCampaign' },
            channel: { type: 'one', localKey: 'channelId', model: 'channel' },
        },
    },
    shareLink: {
        primaryKey: 'id',
        uniqueFields: ['token'],
        autoTimestamps: true,
        defaults: { isActive: true },
        relations: {
            brand: { type: 'one', localKey: 'brandId', model: 'brand' },
        },
    },
    invoice: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: true,
        defaults: { status: 'Draft', currencySymbol: 'Rp' },
        relations: {
            user: { type: 'one', localKey: 'userId', model: 'user' },
        },
    },
    igExtraction: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: false,
        relations: {
            user: { type: 'one', localKey: 'userId', model: 'user' },
        },
    },
    ttExtraction: {
        primaryKey: 'id',
        uniqueFields: [],
        autoTimestamps: false,
        relations: {
            user: { type: 'one', localKey: 'userId', model: 'user' },
        },
    },
    appConfig: {
        primaryKey: 'key',
        uniqueFields: [],
        autoTimestamps: true,
        relations: {},
    },
};

// ─── ID Generation ───────────────────────────────────────────────────────────

let _idCounter = 0;
function generateId(): string {
    return `mock_${Date.now().toString(36)}_${(++_idCounter).toString(36)}`;
}

// ─── Where Clause Matching ───────────────────────────────────────────────────

function matchesWhere(record: any, where: any): boolean {
    if (!where || Object.keys(where).length === 0) return true;

    for (const [key, value] of Object.entries(where)) {
        if (key === 'OR') {
            if (!(value as any[]).some(cond => matchesWhere(record, cond))) return false;
            continue;
        }
        if (key === 'AND') {
            if (!(value as any[]).every(cond => matchesWhere(record, cond))) return false;
            continue;
        }
        if (key === 'NOT') {
            if (matchesWhere(record, value)) return false;
            continue;
        }

        const fieldValue = record[key];

        // null / undefined / primitive direct equality
        if (value === null || value === undefined || typeof value !== 'object') {
            if (fieldValue !== value) return false;
            continue;
        }

        // Date direct equality
        if (value instanceof Date) {
            const fv = fieldValue instanceof Date ? fieldValue.getTime() : new Date(fieldValue).getTime();
            if (fv !== value.getTime()) return false;
            continue;
        }

        // Operator object
        const ops = value as Record<string, any>;

        if ('equals' in ops) {
            if (fieldValue !== ops.equals) return false;
        }
        if ('not' in ops) {
            if (typeof ops.not === 'object' && ops.not !== null && !(ops.not instanceof Date)) {
                // Nested NOT operators
                if (matchesFieldOps(fieldValue, ops.not)) return false;
            } else {
                if (fieldValue === ops.not) return false;
            }
        }
        if ('in' in ops) {
            if (!(ops.in as any[]).includes(fieldValue)) return false;
        }
        if ('notIn' in ops) {
            if ((ops.notIn as any[]).includes(fieldValue)) return false;
        }
        if ('contains' in ops) {
            const mode = ops.mode === 'insensitive' ? 'i' : '';
            const str = String(fieldValue || '');
            const search = String(ops.contains);
            if (mode === 'i') {
                if (!str.toLowerCase().includes(search.toLowerCase())) return false;
            } else {
                // PostgreSQL contains is case-insensitive by default with Prisma
                if (!str.toLowerCase().includes(search.toLowerCase())) return false;
            }
        }
        if ('startsWith' in ops) {
            if (!String(fieldValue || '').toLowerCase().startsWith(String(ops.startsWith).toLowerCase())) return false;
        }
        if ('endsWith' in ops) {
            if (!String(fieldValue || '').toLowerCase().endsWith(String(ops.endsWith).toLowerCase())) return false;
        }
        if ('gt' in ops) {
            if (!(compareValues(fieldValue, ops.gt) > 0)) return false;
        }
        if ('gte' in ops) {
            if (!(compareValues(fieldValue, ops.gte) >= 0)) return false;
        }
        if ('lt' in ops) {
            if (!(compareValues(fieldValue, ops.lt) < 0)) return false;
        }
        if ('lte' in ops) {
            if (!(compareValues(fieldValue, ops.lte) <= 0)) return false;
        }
    }

    return true;
}

function matchesFieldOps(fieldValue: any, ops: Record<string, any>): boolean {
    // Helper for nested NOT operators
    for (const [op, opVal] of Object.entries(ops)) {
        if (op === 'equals' && fieldValue !== opVal) return false;
        if (op === 'contains' && !String(fieldValue || '').toLowerCase().includes(String(opVal).toLowerCase())) return false;
    }
    return true;
}

function compareValues(a: any, b: any): number {
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (a instanceof Date) return a.getTime() - new Date(b).getTime();
    if (b instanceof Date) return new Date(a).getTime() - b.getTime();
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

// ─── OrderBy ─────────────────────────────────────────────────────────────────

function applyOrderBy(records: any[], orderBy: any): any[] {
    if (!orderBy) return records;
    const entries = Array.isArray(orderBy) ? orderBy : [orderBy];
    return [...records].sort((a, b) => {
        for (const entry of entries) {
            for (const [field, direction] of Object.entries(entry)) {
                const dir = direction as SortDir;
                const cmp = compareValues(a[field], b[field]);
                if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
            }
        }
        return 0;
    });
}

// ─── Select Projection ──────────────────────────────────────────────────────

function applySelect(record: any, select: any): any {
    if (!select) return record;
    const result: any = {};
    for (const [key, include] of Object.entries(select)) {
        if (include) result[key] = record[key];
    }
    return result;
}

// ─── Relation Resolution (Include) ──────────────────────────────────────────

function resolveIncludes(record: any, include: any, modelName: string, store: MockStore): any {
    if (!include) return record;
    const schema = SCHEMAS[modelName];
    if (!schema) return record;

    const result = { ...record };

    for (const [key, includeValue] of Object.entries(include)) {
        const rel = schema.relations[key];
        if (!rel) continue;

        if (rel.type === 'many') {
            let related = store.getAll(rel.model).filter(r => r[rel.foreignKey!] === record[schema.primaryKey] || r[rel.foreignKey!] === record.id);

            const incVal = includeValue as any;
            if (typeof incVal === 'object' && incVal !== null && incVal !== true) {
                if (incVal.where) related = related.filter(r => matchesWhere(r, incVal.where));
                if (incVal.orderBy) related = applyOrderBy(related, incVal.orderBy);
                if (incVal.skip) related = related.slice(incVal.skip);
                if (incVal.take) related = related.slice(0, incVal.take);
                if (incVal.include) related = related.map(r => resolveIncludes(r, incVal.include, rel.model, store));
                if (incVal.select) related = related.map(r => applySelect(r, incVal.select));
            }

            result[key] = related.map(r => ({ ...r }));
        } else if (rel.type === 'one') {
            const fkValue = record[rel.localKey!];
            if (fkValue == null) {
                result[key] = null;
            } else {
                const targetSchema = SCHEMAS[rel.model];
                const targetPk = targetSchema?.primaryKey || 'id';
                const found = store.getAll(rel.model).find(r => r[targetPk] === fkValue);
                const incVal2 = includeValue as any;
                if (found && typeof incVal2 === 'object' && incVal2 !== null && incVal2 !== true) {
                    result[key] = incVal2.include ? resolveIncludes({ ...found }, incVal2.include, rel.model, store) : { ...found };
                } else {
                    result[key] = found ? { ...found } : null;
                }
            }
        }
    }

    return result;
}

// ─── Deep Clone ──────────────────────────────────────────────────────────────

function safeClone<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    try {
        return structuredClone(obj);
    } catch {
        return JSON.parse(JSON.stringify(obj, (_, v) => v instanceof Date ? v.toISOString() : v));
    }
}

// ─── In-Memory Store ─────────────────────────────────────────────────────────

class MockStore {
    private tables: Map<string, any[]> = new Map();

    constructor(seed: Record<string, any[]>) {
        for (const [model, records] of Object.entries(seed)) {
            this.tables.set(model, [...records]);
        }
    }

    getAll(model: string): any[] {
        return this.tables.get(model) || [];
    }

    insert(model: string, record: any): void {
        if (!this.tables.has(model)) this.tables.set(model, []);
        this.tables.get(model)!.push(record);
    }

    removeWhere(model: string, predicate: (r: any) => boolean): number {
        const table = this.tables.get(model);
        if (!table) return 0;
        const before = table.length;
        this.tables.set(model, table.filter(r => !predicate(r)));
        return before - this.tables.get(model)!.length;
    }

    findByUnique(model: string, where: any): any | null {
        const schema = SCHEMAS[model];
        if (!schema) return null;
        const table = this.getAll(model);

        // Check primary key
        if (where[schema.primaryKey] !== undefined) {
            return table.find(r => r[schema.primaryKey] === where[schema.primaryKey]) || null;
        }

        // Check unique fields
        for (const field of schema.uniqueFields) {
            if (where[field] !== undefined) {
                return table.find(r => r[field] === where[field]) || null;
            }
        }

        // Fallback: match all where conditions
        return table.find(r => matchesWhere(r, where)) || null;
    }
}

// ─── Model Delegate ──────────────────────────────────────────────────────────

class MockModelDelegate {
    constructor(private modelName: string, private store: MockStore) {}

    async findMany(args?: {
        where?: any; include?: any; select?: any;
        orderBy?: any; take?: number; skip?: number;
    }): Promise<any[]> {
        let records = this.store.getAll(this.modelName);
        if (args?.where) records = records.filter(r => matchesWhere(r, args.where));
        if (args?.orderBy) records = applyOrderBy(records, args.orderBy);
        if (args?.skip) records = records.slice(args.skip);
        if (args?.take) records = records.slice(0, args.take);
        if (args?.include) records = records.map(r => resolveIncludes(r, args.include, this.modelName, this.store));
        if (args?.select) records = records.map(r => applySelect(r, args.select));
        return safeClone(records);
    }

    async findUnique(args: { where: any; include?: any; select?: any }): Promise<any | null> {
        const record = this.store.findByUnique(this.modelName, args.where);
        if (!record) return null;
        let result = record;
        if (args.include) result = resolveIncludes(result, args.include, this.modelName, this.store);
        if (args.select) result = applySelect(result, args.select);
        return safeClone(result);
    }

    async findFirst(args?: { where?: any; include?: any; select?: any; orderBy?: any }): Promise<any | null> {
        let records = this.store.getAll(this.modelName);
        if (args?.where) records = records.filter(r => matchesWhere(r, args.where));
        if (args?.orderBy) records = applyOrderBy(records, args.orderBy);
        if (records.length === 0) return null;
        let result = records[0];
        if (args?.include) result = resolveIncludes(result, args.include, this.modelName, this.store);
        if (args?.select) result = applySelect(result, args.select);
        return safeClone(result);
    }

    async create(args: { data: any; include?: any }): Promise<any> {
        const schema = SCHEMAS[this.modelName];
        const record = { ...args.data };

        // Auto-generate primary key
        if (!record[schema.primaryKey] && schema.primaryKey === 'id') {
            record.id = generateId();
        }

        // Apply defaults
        if (schema.defaults) {
            for (const [key, val] of Object.entries(schema.defaults)) {
                if (record[key] === undefined) {
                    record[key] = typeof val === 'function' ? val() : val;
                }
            }
        }

        // Auto timestamps
        if (schema.autoTimestamps) {
            if (!record.createdAt) record.createdAt = new Date();
            if (!record.updatedAt) record.updatedAt = new Date();
        } else if (!record.createdAt && this.store.getAll(this.modelName).some(r => 'createdAt' in r)) {
            record.createdAt = new Date();
        }

        this.store.insert(this.modelName, record);

        let result = record;
        if (args.include) result = resolveIncludes(result, args.include, this.modelName, this.store);
        return safeClone(result);
    }

    async update(args: { where: any; data: any; include?: any }): Promise<any> {
        const record = this.store.findByUnique(this.modelName, args.where);
        if (!record) {
            throw new Error(`[MockDB] Record not found in "${this.modelName}" for update. Where: ${JSON.stringify(args.where)}`);
        }

        // Protect master admin — cannot change critical fields
        if (record.protected) {
            const { email, password, role, status, protected: _p, ...safeData } = args.data;
            Object.assign(record, safeData);
        } else {
            // Merge update data
            Object.assign(record, args.data);
        }

        // Auto-update timestamp
        const schema = SCHEMAS[this.modelName];
        if (schema.autoTimestamps) {
            record.updatedAt = new Date();
        }

        let result = record;
        if (args.include) result = resolveIncludes(result, args.include, this.modelName, this.store);
        return safeClone(result);
    }

    async delete(args: { where: any }): Promise<any> {
        const record = this.store.findByUnique(this.modelName, args.where);
        if (!record) {
            throw new Error(`[MockDB] Record not found in "${this.modelName}" for delete. Where: ${JSON.stringify(args.where)}`);
        }
        if (record.protected) {
            throw new Error(`[MockDB] Cannot delete protected record "${record.email || record.id}"`);
        }
        this.store.removeWhere(this.modelName, r => r === record);
        return safeClone(record);
    }

    async deleteMany(args?: { where?: any }): Promise<{ count: number }> {
        if (!args?.where) {
            const count = this.store.getAll(this.modelName).filter(r => !r.protected).length;
            this.store.removeWhere(this.modelName, r => !r.protected);
            return { count };
        }
        const count = this.store.removeWhere(this.modelName, r => matchesWhere(r, args.where) && !r.protected);
        return { count };
    }

    async upsert(args: { where: any; update: any; create: any; include?: any }): Promise<any> {
        const existing = this.store.findByUnique(this.modelName, args.where);
        if (existing) {
            return this.update({ where: args.where, data: args.update, include: args.include });
        }
        return this.create({ data: args.create, include: args.include });
    }

    async count(args?: { where?: any }): Promise<number> {
        let records = this.store.getAll(this.modelName);
        if (args?.where) records = records.filter(r => matchesWhere(r, args.where));
        return records.length;
    }

    async aggregate(args?: { where?: any; _sum?: any; _avg?: any; _min?: any; _max?: any; _count?: any }): Promise<any> {
        let records = this.store.getAll(this.modelName);
        if (args?.where) records = records.filter(r => matchesWhere(r, args.where));

        const result: any = {};

        if (args?._sum) {
            result._sum = {};
            for (const field of Object.keys(args._sum)) {
                if (args._sum[field]) {
                    result._sum[field] = records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
                }
            }
        }

        if (args?._avg) {
            result._avg = {};
            for (const field of Object.keys(args._avg)) {
                if (args._avg[field]) {
                    const vals = records.map(r => Number(r[field])).filter(v => !isNaN(v));
                    result._avg[field] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
                }
            }
        }

        if (args?._min) {
            result._min = {};
            for (const field of Object.keys(args._min)) {
                if (args._min[field]) {
                    const vals = records.map(r => r[field]).filter(v => v != null);
                    result._min[field] = vals.length > 0 ? Math.min(...vals.map(Number)) : null;
                }
            }
        }

        if (args?._max) {
            result._max = {};
            for (const field of Object.keys(args._max)) {
                if (args._max[field]) {
                    const vals = records.map(r => r[field]).filter(v => v != null);
                    result._max[field] = vals.length > 0 ? Math.max(...vals.map(Number)) : null;
                }
            }
        }

        if (args?._count) {
            result._count = typeof args._count === 'boolean' ? records.length : {};
            if (typeof args._count === 'object') {
                for (const field of Object.keys(args._count)) {
                    if (args._count[field]) {
                        result._count[field] = records.filter(r => r[field] != null).length;
                    }
                }
            }
        }

        return result;
    }

    async groupBy(args: { by: string[]; where?: any; _sum?: any; _count?: any; _avg?: any; orderBy?: any }): Promise<any[]> {
        let records = this.store.getAll(this.modelName);
        if (args.where) records = records.filter(r => matchesWhere(r, args.where));

        const groups = new Map<string, any[]>();
        for (const record of records) {
            const key = args.by.map(f => String(record[f] ?? 'null')).join('|');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(record);
        }

        return Array.from(groups.entries()).map(([, groupRecords]) => {
            const row: any = {};
            for (const field of args.by) {
                row[field] = groupRecords[0][field];
            }
            if (args._count) {
                row._count = typeof args._count === 'boolean'
                    ? groupRecords.length
                    : Object.fromEntries(Object.keys(args._count).map(f => [f, groupRecords.filter(r => r[f] != null).length]));
            }
            if (args._sum) {
                row._sum = {};
                for (const f of Object.keys(args._sum)) {
                    if (args._sum[f]) row._sum[f] = groupRecords.reduce((s, r) => s + (Number(r[f]) || 0), 0);
                }
            }
            if (args._avg) {
                row._avg = {};
                for (const f of Object.keys(args._avg)) {
                    if (args._avg[f]) {
                        const vals = groupRecords.map(r => Number(r[f])).filter(v => !isNaN(v));
                        row._avg[f] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
                    }
                }
            }
            return row;
        });
    }
}

// ─── Raw SQL Handler ─────────────────────────────────────────────────────────

function handleRawQuery(sql: string, store: MockStore, params: any[]): any[] {
    const trimmed = sql.trim().toLowerCase();

    // RLS set_config — no-op
    if (trimmed.includes('set_config')) {
        return [{ set_config: '' }];
    }

    // List tables
    if (trimmed.includes('information_schema.tables') && !params.length) {
        return Object.values(TABLE_NAME_MAP).map(name => ({ name }));
    }

    // Validate table exists (with param)
    if (trimmed.includes('information_schema.tables') && params.length === 1) {
        const tableName = params[0];
        if (Object.values(TABLE_NAME_MAP).includes(tableName)) {
            return [{ table_name: tableName }];
        }
        return [];
    }

    // Get columns for a table
    if (trimmed.includes('information_schema.columns') && trimmed.includes('column_name') && params.length >= 1) {
        const tableName = params[0];
        const cols = COLUMN_SCHEMAS[tableName];
        if (cols) {
            return cols.map((c: any) => ({
                column_name: c.name,
                data_type: c.type,
                is_nullable: c.nullable ? 'YES' : 'NO',
                column_default: c.default || null,
                is_pk: c.pk || false,
            }));
        }
        return [];
    }

    // Get foreign keys
    if (trimmed.includes('foreign key') || trimmed.includes('constraint_type')) {
        // Return empty for simplicity — schema view will show tables without FK lines
        return [];
    }

    // SELECT * FROM "TableName" with pagination
    const selectMatch = sql.match(/FROM\s+"(\w+)"/i);
    if (selectMatch && trimmed.startsWith('select')) {
        const tableName = selectMatch[1];
        const modelName = Object.entries(TABLE_NAME_MAP).find(([_, v]) => v === tableName)?.[0];
        if (modelName) {
            let records = store.getAll(modelName);

            // Handle COUNT
            if (trimmed.includes('count(*)')) {
                return [{ count: BigInt(records.length) }];
            }

            // Handle ILIKE search
            if (trimmed.includes('ilike') && params.length > 0) {
                const searchTerm = String(params[0]).replace(/%/g, '').toLowerCase();
                if (searchTerm) {
                    records = records.filter(r =>
                        Object.values(r).some(v =>
                            v !== null && v !== undefined && String(v).toLowerCase().includes(searchTerm)
                        )
                    );
                }
            }

            // Handle COUNT after filtering
            if (trimmed.includes('count(*)')) {
                return [{ count: BigInt(records.length) }];
            }

            // Handle LIMIT/OFFSET from params
            const limitIdx = params.findIndex((p, i) => typeof p === 'number' && i >= params.length - 2);
            if (limitIdx >= 0 && params.length >= 2) {
                const limit = params[params.length - 2];
                const offset = params[params.length - 1];
                if (typeof limit === 'number' && typeof offset === 'number') {
                    records = records.slice(offset, offset + limit);
                }
            }

            return safeClone(records);
        }
    }

    // Default: return empty
    return [];
}

// ─── Mock Prisma Client ──────────────────────────────────────────────────────

class MockPrismaClient {
    _store: MockStore;

    constructor() {
        this._store = new MockStore(SEED_DATA);
        console.log('[MockDB] In-memory database active with seed data');
    }

    // Model delegates
    get user() { return new MockModelDelegate('user', this._store); }
    get userBrand() { return new MockModelDelegate('userBrand', this._store); }
    get brand() { return new MockModelDelegate('brand', this._store); }
    get industry() { return new MockModelDelegate('industry', this._store); }
    get industrySubType() { return new MockModelDelegate('industrySubType', this._store); }
    get campaign() { return new MockModelDelegate('campaign', this._store); }
    get subCampaign() { return new MockModelDelegate('subCampaign', this._store); }
    get platform() { return new MockModelDelegate('platform', this._store); }
    get channel() { return new MockModelDelegate('channel', this._store); }
    get campaignChannel() { return new MockModelDelegate('campaignChannel', this._store); }
    get subCampaignChannel() { return new MockModelDelegate('subCampaignChannel', this._store); }
    get integration() { return new MockModelDelegate('integration', this._store); }
    get metric() { return new MockModelDelegate('metric', this._store); }
    get shareLink() { return new MockModelDelegate('shareLink', this._store); }
    get invoice() { return new MockModelDelegate('invoice', this._store); }
    get igExtraction() { return new MockModelDelegate('igExtraction', this._store); }
    get ttExtraction() { return new MockModelDelegate('ttExtraction', this._store); }
    get appConfig() { return new MockModelDelegate('appConfig', this._store); }
    get activityLog() { return new MockModelDelegate('activityLog', this._store); }
    get apiKey() { return new MockModelDelegate('apiKey', this._store); }
    get scheduledReport() { return new MockModelDelegate('scheduledReport', this._store); }
    get whitelabelDomain() { return new MockModelDelegate('whitelabelDomain', this._store); }
    get campaignIntegration() { return new MockModelDelegate('campaignIntegration', this._store); }
    get creative() { return new MockModelDelegate('creative', this._store); }

    // Raw SQL
    async $queryRawUnsafe(sql: string, ...params: any[]): Promise<any[]> {
        return handleRawQuery(sql, this._store, params);
    }

    // Transaction — execute function with self as the "transaction client"
    async $transaction(fnOrArray: any): Promise<any> {
        if (typeof fnOrArray === 'function') {
            return fnOrArray(this);
        }
        // Array of promises
        if (Array.isArray(fnOrArray)) {
            return Promise.all(fnOrArray);
        }
        return fnOrArray;
    }

    // Prisma client lifecycle methods (no-ops for mock)
    async $connect(): Promise<void> {}
    async $disconnect(): Promise<void> {}
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createMockPrisma(): any {
    const client = new MockPrismaClient();
    // Proxy: any unknown model returns a no-op delegate so missing models don't crash
    return new Proxy(client, {
        get(target: any, prop: string) {
            if (prop in target) return target[prop];
            // Return a delegate that operates on an empty table for any unknown model
            if (typeof prop === 'string' && prop[0] === prop[0].toLowerCase() && prop[0] !== '$' && prop[0] !== '_') {
                return new MockModelDelegate(prop, target._store);
            }
            return undefined;
        }
    });
}
