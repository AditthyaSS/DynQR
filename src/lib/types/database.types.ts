export type QRCode = {
    id: string
    user_id: string
    short_id: string
    name: string
    current_url: string
    description: string | null
    scan_count: number
    is_active: boolean
    created_at: string
    updated_at: string
    last_scanned_at: string | null
}

export type QRCodeInsert = {
    user_id: string
    short_id: string
    name: string
    current_url: string
    description?: string | null
}

export type QRCodeUpdate = {
    name?: string
    current_url?: string
    description?: string | null
    is_active?: boolean
    scan_count?: number
    last_scanned_at?: string
}

export type Database = {
    public: {
        Tables: {
            qr_codes: {
                Row: QRCode
                Insert: QRCodeInsert
                Update: QRCodeUpdate
            }
        }
    }
}
