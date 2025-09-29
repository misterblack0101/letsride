import { CollectionReference, Query, WhereFilterOp } from 'firebase-admin/firestore';

/**
 * A query builder for Firestore to dynamically construct queries
 */
export class FirestoreQueryBuilder<T = any> {
    private query: Query;
    private queryConditions: { field: string; operator: WhereFilterOp; value: any }[] = [];
    private orderByFields: { field: string; direction: 'asc' | 'desc' }[] = [];
    private limitValue: number | null = null;
    private startAfterDoc: any = null;

    constructor(collectionRef: CollectionReference) {
        this.query = collectionRef;
    }

    /**
     * Adds a where condition to the query
     */
    where(field: string, operator: WhereFilterOp, value: any): FirestoreQueryBuilder<T> {
        // Only add filter if value is defined and not an empty array
        if (value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)) {
            this.queryConditions.push({ field, operator, value });
        }
        return this;
    }

    /**
     * Adds an orderBy condition to the query
     */
    orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): FirestoreQueryBuilder<T> {
        this.orderByFields.push({ field, direction });
        return this;
    }

    /**
     * Sets the limit for the query
     */
    limit(limit: number): FirestoreQueryBuilder<T> {
        if (limit > 0) {
            this.limitValue = limit;
        }
        return this;
    }

    /**
     * Sets the startAfter document for the query (for pagination)
     */
    startAfter(doc: any): FirestoreQueryBuilder<T> {
        if (doc) {
            this.startAfterDoc = doc;
        }
        return this;
    }

    /**
     * Builds and returns the Firestore query
     */
    build(): Query<T> {
        let builtQuery = this.query as Query<T>;

        // Apply where conditions
        for (const condition of this.queryConditions) {
            builtQuery = builtQuery.where(condition.field, condition.operator, condition.value);
        }

        // Apply orderBy
        for (const order of this.orderByFields) {
            builtQuery = builtQuery.orderBy(order.field, order.direction);
        }

        // Apply startAfter for pagination
        if (this.startAfterDoc) {
            builtQuery = builtQuery.startAfter(this.startAfterDoc);
        }

        // Apply limit
        if (this.limitValue !== null) {
            builtQuery = builtQuery.limit(this.limitValue);
        }

        return builtQuery;
    }

    /**
     * Builds the query and executes it
     */
    async execute(): Promise<T[]> {
        const querySnapshot = await this.build().get();
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    }
}

/**
 * Helper function to create a query builder
 */
export function createQueryBuilder<T>(collection: CollectionReference): FirestoreQueryBuilder<T> {
    return new FirestoreQueryBuilder<T>(collection);
}