export interface InventoryBase {
    _id?: string;
    product_name: string;
    image_url?: string;
    brand_owner: string;
    brands?: string;
    quantity?: number;
    code?: string;
    __key?: string;
    created?: string;
    expire?: string;
    session_key?: string;
    removed?: boolean;
    pending?: boolean;
}
