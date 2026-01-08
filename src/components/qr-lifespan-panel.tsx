'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, RotateCcw, Clock, Hash, Link2, AlertTriangle } from 'lucide-react'

export interface QRLifespanConfig {
    maxScans: number | null
    expiresAt: string | null
    fallbackUrl: string | null
}

export const DEFAULT_LIFESPAN_CONFIG: QRLifespanConfig = {
    maxScans: null,
    expiresAt: null,
    fallbackUrl: null,
}

interface QRLifespanPanelProps {
    config: QRLifespanConfig
    onMaxScansChange: (value: number | null) => void
    onExpiresAtChange: (value: string | null) => void
    onFallbackUrlChange: (value: string | null) => void
    onReset: () => void
    currentScanCount?: number
}

export function QRLifespanPanel({
    config,
    onMaxScansChange,
    onExpiresAtChange,
    onFallbackUrlChange,
    onReset,
    currentScanCount = 0,
}: QRLifespanPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const hasAnyConfig = config.maxScans !== null || config.expiresAt !== null || config.fallbackUrl !== null

    // Calculate status
    const remainingScans = config.maxScans !== null ? Math.max(0, config.maxScans - currentScanCount) : null
    const isExpired = config.expiresAt ? new Date() > new Date(config.expiresAt) : false
    const isScanLimitReached = config.maxScans !== null && currentScanCount >= config.maxScans

    // Format datetime for input
    const formatDateTimeLocal = (isoString: string | null) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return date.toISOString().slice(0, 16)
    }

    // Handle date input change
    const handleExpiresAtChange = (value: string) => {
        if (!value) {
            onExpiresAtChange(null)
        } else {
            onExpiresAtChange(new Date(value).toISOString())
        }
    }

    // Handle max scans input
    const handleMaxScansChange = (value: string) => {
        const num = parseInt(value, 10)
        if (isNaN(num) || num < 1) {
            onMaxScansChange(null)
        } else {
            onMaxScansChange(num)
        }
    }

    return (
        <div className="space-y-3">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-700/50 transition-colors ${hasAnyConfig
                        ? 'bg-amber-600/20 border border-amber-500/50'
                        : 'bg-slate-700/30'
                    }`}
            >
                <span className={`text-sm font-medium ${hasAnyConfig ? 'text-amber-300' : 'text-slate-300'}`}>
                    ⏱️ QR Lifespan (Optional)
                    {hasAnyConfig && <span className="ml-2 text-xs opacity-75">• Active</span>}
                </span>
                {isExpanded ? (
                    <ChevronUp className={`h-4 w-4 ${hasAnyConfig ? 'text-amber-400' : 'text-slate-400'}`} />
                ) : (
                    <ChevronDown className={`h-4 w-4 ${hasAnyConfig ? 'text-amber-400' : 'text-slate-400'}`} />
                )}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="p-4 bg-slate-700/20 rounded-lg space-y-4">
                    {/* Status Warnings */}
                    {(isExpired || isScanLimitReached) && (
                        <div className="flex items-center gap-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {isExpired && 'This QR code has expired. '}
                                {isScanLimitReached && 'Scan limit reached. '}
                                Scans will redirect to fallback URL or show expired page.
                            </span>
                        </div>
                    )}

                    {/* Max Scans */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Max Scans
                        </Label>
                        <Input
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            value={config.maxScans ?? ''}
                            onChange={(e) => handleMaxScansChange(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                        {remainingScans !== null && (
                            <p className="text-xs text-slate-500">
                                {remainingScans} scan{remainingScans !== 1 ? 's' : ''} remaining
                            </p>
                        )}
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Expire After
                        </Label>
                        <Input
                            type="datetime-local"
                            value={formatDateTimeLocal(config.expiresAt)}
                            onChange={(e) => handleExpiresAtChange(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                        />
                        <p className="text-xs text-slate-500">
                            QR will stop working after this date/time
                        </p>
                    </div>

                    {/* Fallback URL */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Fallback URL (after expiry)
                        </Label>
                        <Input
                            type="url"
                            placeholder="https://example.com/thank-you"
                            value={config.fallbackUrl ?? ''}
                            onChange={(e) => onFallbackUrlChange(e.target.value || null)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                        <p className="text-xs text-slate-500">
                            Redirect here after expiry instead of showing an error
                        </p>
                    </div>

                    {/* Reset Button */}
                    {hasAnyConfig && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="text-slate-400 hover:text-white"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Clear All Lifespan Rules
                        </Button>
                    )}

                    {/* Info */}
                    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-500">
                            <strong className="text-slate-400">Note:</strong> Leaving fields empty means no limit.
                            Expiry checks happen in this order: manual disable → time expiry → scan limit.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
